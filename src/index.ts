const mainFile = require("./main");
const utils = require("./utils");
const chalk = require("chalk");
const boxen = require("boxen");
const correctContractTestHandler = require("./correctContractTest");

const main = async () => {
  utils.clearAndRenderBanner();
  if (process.argv.length < 3) {
    console.error(
      "[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id> or mutableai_cli correct_contract_test <run command> <test file path>"
    );
    return;
  }
  if (process.argv[2] == "sync") {
    if (process.argv.length != 4) {
      console.error(
        "[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id>"
      );
      return;
    }
  } else if (process.argv[2] == "correct_contract_test") {
    if (process.argv.length < 4) {
      console.error(
        "[ERROR] Failed to run CLI. The command is mutableai_cli correct_contract_test <github repo url> <run command> <test file path> <-a for automatic without human feedback>"
      );
      return;
    }
  } else {
    console.error(
      "[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id> or mutableai_cli correct_contract_test <run command> <test file path>"
    );
    return;
  }
  const greeting = chalk.white.bold("Mutable.ai");
  const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "blue",
    backgroundColor: "#555555",
  };
  const msgBox = boxen(greeting, boxenOptions);
  console.log(msgBox);
  if (process.argv[2] == "sync") {
    mainFile.main(process.argv[3]);
    return;
  } else if (process.argv[2] == "correct_contract_test") {
    const isAutomaticValue = findFlagValue(
      process.argv,
      "--automatic",
      true,
      false
    );
    const isAutomatic = isAutomaticValue ? true : false;
    const command = findFlagValue(process.argv, "--command");
    const repoUrl = findFlagValue(process.argv, "--url");
    const testFilePath = findFlagValue(process.argv, "--test-file-path");
    const consumerTestFilePath = findFlagValue(
      process.argv,
      "--consumer-test-file-path",
      true,
      true
    );
    await correctContractTestHandler.correctContractTest(
      repoUrl,
      command,
      testFilePath,
      isAutomatic,
      consumerTestFilePath
    );
    process.exit();
  }
};

function findFlagValue(
  argv: string[],
  flagValue: string,
  isOptional = false,
  hasValue = true
): string | null {
  if (!flagValue.startsWith("--")) {
    throw new Error(`${flagValue} needs to start with -`);
  }
  const flagIndex = argv.indexOf(flagValue);
  if (flagIndex >= 0) {
    if (hasValue && flagIndex + 1 >= argv.length) {
      throw new Error(`${flagValue} is mal-formed`);
    }
    if (hasValue) {
      const retrievedflagValue = argv[flagIndex + 1];
      if (retrievedflagValue.startsWith("-")) {
        throw new Error(`${flagValue} is mal-formed`);
      }
      return retrievedflagValue;
    } else {
      return "true";
    }
  } else {
    if (!isOptional) {
      throw new Error(`${flagValue} not found`);
    }
    return null;
  }
}

main();
