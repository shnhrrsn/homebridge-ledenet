import int2hex from '../../src/Colors/int2hex'
import net from 'net'

const localPort = 5577
const reportPort = 5577
const remoteHost = '10.0.1.102'

const server = net.createServer(local => {
	const remote = new net.Socket()
	remote.connect(reportPort, remoteHost)

	local.on('connect', () => {
		console.log(
			'Connection #%d from %s:%d',
			server.connections,
			local.remoteAddress,
			local.remotePort,
		)
	})

	local.on('data', data => {
		console.log('SEND', Array.from(data).map(int2hex).join(', '))
	})

	remote.on('data', data => {
		console.log('SEND', Array.from(data).map(int2hex).join(', '))
	})

	local.on('close', () => {
		remote.end()
	})

	remote.on('close', () => {
		local.end()
	})
})

server.listen(localPort)
console.log('Proxying from localhost:%d to %s:%d', localPort, remoteHost, reportPort)
