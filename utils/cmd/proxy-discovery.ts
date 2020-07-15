import proxy from 'udp-proxy'

const server = proxy.createServer({
	address: '10.0.1.102',
	port: 48899,
	ipv6: false,
	localaddress: '0.0.0.0',
	localport: 48899,
	localipv6: false,
	timeOutTime: 10000,
	middleware: {
		message: (msg, sender, next) => {
			next(msg, sender)
		},

		proxyMsg: (msg, sender, peer, next) => {
			if (msg.toString().indexOf('C82B9642D32C') >= 0) {
				msg = Buffer.from(msg.toString().replace(/C82B9642D32C/g, 'AAAAAAAAAAAA'))
			}
			if (msg.toString().indexOf('10.0.1.102') >= 0) {
				msg = Buffer.from(msg.toString().replace(/10\.0\.1\.102/g, '10.0.1.10'))
			}
			next(msg, sender, peer)
		},
	},
})

server.on('listening')

server.on('message', message => {
	console.log('SEND', message.toString())
})

server.on('proxyMsg', message => {
	console.log('RECV', message.toString())
})

server.on('proxyError', err => {
	console.log('ProxyError', err)
	process.exit(1)
})

server.on('error', err => {
	console.log('Error', err)
	process.exit(1)
})
