const realtime = require('./realtime')
const branch = require('./branch')
const fileUtils = require('./fileUtils')
const auth = require('./auth')

// Entrypoint of the CLI
async function main(session: string) {
	const BRANCH_NAME = 'mutableai_sync'
	// Check pre-condition
	if (!fileUtils.isAtRepoRoot()) {
		console.error(
			'[ERROR] This CLI client needs to be run at the root of the repo. Please rerun the command at repo root.'
		)
		return
	}
	// Authenticate
	try {
		const { userEmail, authKey } = await auth.getStoredKeyAndUserEmail()
		const isAuthenticated = await auth.authenticate(userEmail, authKey)
		if (!isAuthenticated) {
			console.error(
				'[ERROR] Not authenticated successfully. Make sure you have the user account and auth key setup correctly'
			)
			return
		}
		const { supabaseUrl, supabaseApiKey } = await auth.getSupabaseUrlAndKey(
			userEmail,
			authKey
		)
		if (supabaseUrl == '' || supabaseApiKey == '') {
			return
		}
		// setup branch for storing local change
		await branch.createOrCheckOutLocalBranch(BRANCH_NAME)
		await branch.stashAllUncommittedChanges(BRANCH_NAME)
		// Setup realtime pub/sub communication with backend
		realtime.setupSyncChannel(supabaseUrl, supabaseApiKey, session)
	} catch (error: any) {
		console.error(error.message)
	}
}

export {}
exports.main = main
