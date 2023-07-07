const fs = require('fs') as typeof import('fs')
const path = require('path') as typeof import('path')
const util = require('node:util') as typeof import('node:util')
const exec = util.promisify(
	(require('node:child_process') as typeof import('node:child_process')).exec
)

function modifyFile(filepath: string, content: string) {
	const normalizedPath = normalizePath(filepath)
	const parentDirectory = path.dirname(normalizedPath)
	// create directory if not exsited. If exsit it's no-op
	fs.mkdirSync(parentDirectory, { recursive: true })
	fs.writeFile(
		normalizedPath,
		content,
		(err: NodeJS.ErrnoException | null) => {
			if (err) throw err
			console.log(`[INFO] modified/added ${normalizedPath}`)
		}
	)
}

function deleteFile(path: string) {
	fs.unlink(path, (err: NodeJS.ErrnoException | null) => {
		if (err) throw err
		console.log(`[INFO] deleted ${path}`)
	})
}

function normalizePath(path: string): string {
	if (path.startsWith('/')) {
		return '.' + path
	}
	return path
}

function isAtRepoRoot(): boolean {
	return fs.existsSync('.git')
}

async function restoreFile(filepath: string) {
	try {
		await exec(`git restore ${normalizePath(filepath)}`)
		console.log(`[INFO] restored ${filepath}`)
	} catch (error) {
		console.error(`[ERROR] failed to restore ${filepath}`)
	}
}

async function readFile(filepath: string): Promise<string> {
	try {
		const data = fs.readFileSync(filepath, 'utf8')
		return data
	} catch (error) {
		console.error(`[ERROR] failed to read ${filepath}`)
		throw error
	}
}

export {}
exports.modifyFile = modifyFile
exports.deleteFile = deleteFile
exports.normalizePath = normalizePath
exports.isAtRepoRoot = isAtRepoRoot
exports.restoreFile = restoreFile
exports.readFile = readFile
