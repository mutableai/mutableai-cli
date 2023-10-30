const mainFile = require('./main')
const utils = require('./utils')
const chalk = require('chalk')
const boxen = require('boxen')
const correctContractTestHandler = require('./correctContractTest')

const main = () => {
	utils.clearAndRenderBanner()
	if (process.argv.length < 3) {
		console.error(
			'[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id> or mutableai_cli correct_contract_test <run command> <test file path>'
		)
		return
	}
	if (process.argv[2] == 'sync') {
		if (process.argv.length != 4) {
			console.error(
				'[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id>'
			)
			return
		}
	} else if (process.argv[2] == 'correct_contract_test') {
		if (process.argv.length != 6) {
			console.error(
				'[ERROR] Failed to run CLI. The command is mutableai_cli correct_contract_test <github repo url> <run command> <test file path>'
			)
			return
		}
	} else {
		console.error(
			'[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id> or mutableai_cli correct_contract_test <run command> <test file path>'
		)
		return
	}
	const greeting = chalk.white.bold('Mutable.ai')
	const boxenOptions = {
		padding: 1,
		margin: 1,
		borderStyle: 'round',
		borderColor: 'blue',
		backgroundColor: '#555555',
	}
	const msgBox = boxen(greeting, boxenOptions)
	console.log(msgBox)
	if (process.argv[2] == 'sync') {
		mainFile.main(process.argv[3])
		return
	} else if (process.argv[2] == 'correct_contract_test') {
		correctContractTestHandler.correctContractTest(process.argv[3], process.argv[4], process.argv[5])
		return
	}
}

main()
