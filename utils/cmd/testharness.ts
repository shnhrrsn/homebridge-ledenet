import path from 'path'
import fs from 'fs'

export default async function testharness() {
	const fixtures = path.join(__dirname, '../../fixtures')
	const config = require(path.join(fixtures, 'config/config.template.json'))
	fs.writeFileSync(path.join(fixtures, 'config/config.json'), JSON.stringify(config, null, 2))

	process.argv = [
		'',
		'',
		'--user-storage-path',
		path.join(fixtures, 'config'),
		'--plugin-path',
		path.join(fixtures, 'plugins'),
		'--debug',
		'--no-qrcode',
	]

	require('homebridge/lib/cli')()
	return new Promise(() => {})
}
