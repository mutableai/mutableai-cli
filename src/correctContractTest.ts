const fileUtils = require('./fileUtils')
const util = require('node:util') as typeof import('node:util')
const exec = util.promisify(
	(require('node:child_process') as typeof import('node:child_process')).exec
)

async function correctContractTest(githubUrl: string, runCommand: string, testFilePath: string) {
    let file_content = ''
    try {
        file_content = await fileUtils.readFile(testFilePath, 'utf-8');
        console.log(file_content);
      } catch (error) {
        console.error('Error reading file:', error);
        return
      }
      console.log(`github url: ${githubUrl}`)
      console.log(`running command ${runCommand}`)
      const output = await exec(runCommand)
      console.log(output.stdout)
}

export {}
exports.correctContractTest = correctContractTest