const util = require('node:util') as typeof import('node:util')
const exec = util.promisify(
	(require('node:child_process') as typeof import('node:child_process')).exec
)

async function checkIfBranchExisted(branchName: string): Promise<boolean> {
	try {
		const data = await exec(`git rev-parse --verify ${branchName}`)
		if (data.stderr != '') {
			return false
		}
		return true
	} catch (err) {
		return false
	}
}

async function createOrCheckOutLocalBranch(branchName: string) {
	try {
		const isBranchExisted = await checkIfBranchExisted(branchName)
		if (!isBranchExisted) {
			await exec(`git checkout -b ${branchName}`)
			console.log(`[INFO] created ${branchName} for webapp changes`)
		} else {
			await exec(`git checkout ${branchName}`)
			console.log(`[INFO] checked out ${branchName} webapp changes`)
		}
	} catch (err) {
		console.error(`[ERROR] failed to create ${branchName}`)
		throw err
	}
}

async function stashAllUncommittedChanges(branchName: string) {
	try {
		await exec(`git restore .`)
		console.log(
			'[INFO] cleaning up all uncommited/untracked changes in mutableai local edit branch'
		)
	} catch (error) {
		console.log(
			`[ERROR] failed to revert all uncommited changes ${branchName}`
		)
		throw error
	}
}

export {}
exports.createOrCheckOutLocalBranch = createOrCheckOutLocalBranch
exports.stashAllUncommittedChanges = stashAllUncommittedChanges
