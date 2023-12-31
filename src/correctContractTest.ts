const fileUtils = require("./fileUtils");
const util = require("node:util") as typeof import("node:util");
const exec = util.promisify(
  (require("node:child_process") as typeof import("node:child_process")).exec
);
const dotenv = require("dotenv");
const path = require("path") as typeof import("path");
const os = require("os");
const readline = require("node:readline");
const ws = require("ws");
const commonUtil = require("./utils");

const DEFAULT_ITERATION_TIME = 10;
const DEBUGGER_ENDPOINT_URL =
  "wss://70zxlqo8jd.execute-api.us-east-1.amazonaws.com/prod/";

async function correctContractTest(
  githubUrl: string,
  runCommand: string,
  testFilePath: string,
  isAutomatic?: boolean,
  consumerTestFilePath?: string
) {
  dotenv.config({ path: path.resolve(os.homedir() + "/.mutableai") });
  if (!process.env.ACCESS_TOKEN) {
    throw new Error(
      "Access token is not configured. Please go on webapp to authenticate"
    );
  }
  let testRunSuccessfully = false;
  let iteration = 0;
  let fileContent = "";
  const edit_history: { src_code: string; console_output: string }[] = [];
  while (iteration < DEFAULT_ITERATION_TIME && !testRunSuccessfully) {
    if (fileContent == "") {
      try {
        fileContent = await fileUtils.readFile(testFilePath, "utf-8");
      } catch (error) {
        console.error("Error reading file:", error);
        return;
      }
    }
    commonUtil.logInCyan(`Attempt: #${iteration + 1}`);
    commonUtil.logInCyan(`running command: ${runCommand}`);
    let feedback = "";
    let output;
    let commandFailed = false;
    try {
      output = await exec(runCommand);
      feedback = "stdout: " + output.stdout + "\n" + "stderr:" + output.stderr;
    } catch (error) {
      commandFailed = true;
      output = error as { stdout: string; stderr: string };
      feedback = "stdout: " + output.stdout + "\n" + "stderr:" + output.stderr;
    }
    // Push source code and console output pair to history
    edit_history.push({ src_code: fileContent, console_output: feedback });
    console.log(feedback);
    // Detect if the test has passed
    const didTestPass = !commandFailed;
    if (didTestPass) {
      commonUtil.logInCyan("The test passed. AI debugger stopped.");
      break;
    } else {
      commonUtil.logInCyan("The test didn't pass.");
    }

    // Proceed to fixing the test
    let wantToProceed = true;
    if (!isAutomatic) {
      wantToProceed = await askToProceed();
    }
    if (wantToProceed) {
      let consumerTestCode = undefined;
      if (consumerTestFilePath) {
        consumerTestCode = await getConsumerTestCode(consumerTestFilePath);
      }
      commonUtil.logInCyan("Kicking off AI assisted test repair.");
      const newFileContent = await correctTest(
        process.env.ACCESS_TOKEN,
        "main",
        githubUrl,
        testFilePath,
        fileContent,
        feedback,
        edit_history,
        consumerTestCode
      );
      commonUtil.logInCyan("Fix suggested by AI:");
      console.log(newFileContent);
      fileContent = newFileContent;
      let wantToModifyFile = true;
      if (!isAutomatic) {
        wantToModifyFile = await askToModifyFile();
      }
      if (wantToModifyFile) {
        fileUtils.modifyFile(testFilePath, newFileContent);
      }
    } else {
      commonUtil.logInCyan("User chose not to proceed.");
      return;
    }
    iteration++;
  }
}

async function getConsumerTestCode(file_path: string): Promise<string> {
  try {
    const fileContent = await fileUtils.readFile(file_path, "utf-8");
    return fileContent;
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error(`Consumer test file not found at ${file_path}`);
  }
}

async function correctTest(
  accessToken: string,
  branch: string,
  repoUrl: string,
  filePath: string,
  fileContent: string,
  stdout: string,
  edit_history: { src_code: string; console_output: string }[],
  consumerTestCode?: string
): Promise<string> {
  const wsPromise: Promise<string> = new Promise((resolve, reject) => {
    const wsClient = new ws.WebSocket(DEBUGGER_ENDPOINT_URL, [
      process.env.WSS_API_KEY!,
    ]);

    const source_code_dict: { [key: string]: string } = {};
    source_code_dict[filePath] = fileContent;
    const reqMsg = {
      repo_url: repoUrl,
      branch: branch,
      access_token: accessToken,
      debug_type: "contract_test",
      console_output: stdout,
      source_code: source_code_dict,
      edit_history: edit_history,
      consumer_test_code: consumerTestCode,
    };
    let debugOutput = "";
    wsClient.onopen = () => {
      commonUtil.logInCyan("Starts generating fix");
      wsClient.send(JSON.stringify(reqMsg));
    };
    wsClient.onmessage = async (event: any) => {
      let message = event.data;
      try {
        if (typeof message == "object") {
          // The message is a Blob
          message = await message.text();
        }
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "debug_output") {
          process.stdout.write(parsedMessage.data.content);
          debugOutput += parsedMessage.data.content;
        }
        if (parsedMessage.type === "termination") {
          console.log("");
          console.log(`[${parsedMessage.request_id}] Finished generating fix`);
          resolve(debugOutput);
        }
      } catch (e) {
        console.log(`can't parse message: ${e}. The message is ${message}`);
      }
    };
    wsClient.onclose = () => {
      resolve("");
    };
    wsClient.onerror = (error: any) => {
      console.log("ws errored");
      console.log(error);
      reject();
    };
  });

  return wsPromise;
}

async function askToProceed() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // try {
  //   const answer = await rl.question(
  //     "\x1b[33mDo you want to proceed with fixing the test Y/N (default Y)\x1b[0m"
  //   );
  //   const wantToProceed =
  //     answer.trim() === "Y" || answer.trim() === "y" || answer.trim() === "";
  //   rl.close();
  //   return wantToProceed;
  // } catch (err) {
  //   rl.close();
  //   console.log(`Error: `, err);
  //   return false;
  // }
  const answerPromise: Promise<boolean> = new Promise((resolve, reject) => {
    rl.question(
      "\x1b[33mDo you want to proceed with fixing the test Y/N (default Y)\x1b[0m",
      (answer: string) => {
        try {
          const wantToProceed =
            answer.trim() === "Y" ||
            answer.trim() === "y" ||
            answer.trim() === "";
          rl.close();
          resolve(wantToProceed);
        } catch (err) {
          rl.close();
          reject(err);
        }
      }
    );
  });
  return answerPromise;
}

async function askToModifyFile() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await rl.question(
      "\x1b[33mDo you want to accept the change proposed by AI Y/N\x1b[0m"
    );
    const wantToProceed = answer.trim() === "Y" || answer.trim() === "y";
    rl.close();
    return wantToProceed;
  } catch (err) {
    rl.close();
    console.log(`Error: `, err);
    return false;
  }
}

export {};
exports.correctContractTest = correctContractTest;
