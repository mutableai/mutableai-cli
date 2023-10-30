const fileUtils = require('./fileUtils')
const util = require('node:util') as typeof import('node:util')
const exec = util.promisify(
	(require('node:child_process') as typeof import('node:child_process')).exec
)

const DEFAULT_ITERATION_TIME = 3

async function correctContractTest(githubUrl: string, runCommand: string, testFilePath: string) {
    let testRunSuccessfully = false
    let iteration = 0
    while (iteration < DEFAULT_ITERATION_TIME && !testRunSuccessfully) {
        let fileContent = ''
        try {
            fileContent = await fileUtils.readFile(testFilePath, 'utf-8');
        } catch (error) {
            console.error('Error reading file:', error);
            return
        }
        console.log(`running command ${runCommand}`)
        const output = await exec(runCommand)
        testRunSuccessfully = doesTestRunSuccessfully(output.stdout)
        if (!testRunSuccessfully) {
            const newFileContent = await correctTest(githubUrl, fileContent)
            fileUtils.modifyFile(testFilePath, newFileContent)
        } else {
            break
        }
        iteration++
    }
}

function doesTestRunSuccessfully(stdout: string):boolean {
    return false
}

async function correctTest(githubUrl: string, file_content: string): Promise<string> {
    return ''
} 

export {}
exports.correctContractTest = correctContractTest