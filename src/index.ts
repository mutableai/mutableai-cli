const mainFile = require('./main')
const utils = require('./utils')
const chalk = require('chalk')
const boxen = require('boxen')

const main = () => {
	utils.clearAndRenderBanner()
	if (process.argv.length != 4 || process.argv[2] != 'sync') {
		console.error(
			'[ERROR] Failed to run CLI. The command is mutableai_cli sync <session id>'
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
	mainFile.main(process.argv[3])
}

main()
