const fileUtils = require("./fileUtils");
const util = require("node:util") as typeof import("node:util");
const exec = util.promisify(
  (require("node:child_process") as typeof import("node:child_process")).exec
);
const dotenv = require("dotenv");
const path = require("path") as typeof import("path");
const os = require("os");
const axios = require("axios").default;

const DEFAULT_ITERATION_TIME = 3
const DEBUGGER_ENDPOINT_URL = ''

async function correctContractTest(
  githubUrl: string,
  runCommand: string,
  testFilePath: string
) {
  dotenv.config({ path: path.resolve(os.homedir() + "/.mutableai") });
  if (!process.env.ACCESS_TOKEN) {
    throw new Error(
      "Access token is not configured. Please go on webapp to authenticate"
    );
  }
  let testRunSuccessfully = false;
  let iteration = 0;
  while (iteration < DEFAULT_ITERATION_TIME && !testRunSuccessfully) {
    let fileContent = "";
    try {
      fileContent = await fileUtils.readFile(testFilePath, "utf-8");
    } catch (error) {
      console.error("Error reading file:", error);
      return;
    }
    console.log(`running command ${runCommand}`);
    const output = await exec(runCommand);
    console.log(output.stdout);
    testRunSuccessfully = doesTestRunSuccessfully(output.stdout);
    console.log(testRunSuccessfully)
    if (!testRunSuccessfully) {
      const newFileContent = await correctTest(
        process.env.ACCESS_TOKEN,
        "main",
        githubUrl,
        testFilePath,
        fileContent,
        output.stdout,
      );
      fileUtils.modifyFile(testFilePath, newFileContent);
    } else {
      break;
    }
    iteration++;
  }
}

function doesTestRunSuccessfully(stdout: string): boolean {
  return false;
}

async function correctTest(
  accessToken: string,
  branch: string,
  repoUrl: string,
  filePath: string,
  fileContent: string,
  stdout: string
): Promise<string> {
  const source_code_dict: { [key: string]: string } = {};
  source_code_dict[filePath] = fileContent;
  const reqBody = {
    debug_type: "contract_test",
    source_code: source_code_dict,
    console_output: stdout,
    repo_url: repoUrl,
    access_token: accessToken,
    branch: branch,
  };

  try {
    const { data } = await axios.post(DEBUGGER_ENDPOINT_URL, reqBody);
    return data;
  } catch (error) {
    throw new Error("Failed to correct test")
  }
}

export {};
exports.correctContractTest = correctContractTest;
