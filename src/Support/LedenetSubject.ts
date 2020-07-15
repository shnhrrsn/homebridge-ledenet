// Ported from https://github.com/ReactiveX/rxjs/blob/6.5.5/src/internal/observable/dom/WebSocketSubject.ts
import { Socket } from 'net'
import { Subscriber, Subscription, Subject, ReplaySubject } from 'rxjs'
import { AnonymousSubject } from 'rxjs/internal/Subject'
import int2Hex from '../Colors/int2Hex'
import makeDebug from 'debug'
const debug = makeDebug('LEDENET')

const INVALID_ERROR_OBJECT =
	'LedenetSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }'

export default class LedenetSubject extends AnonymousSubject<number[]> {
	private ip: string
	private socket?: Socket
	private output: Subject<number[]>

	constructor(ip: string) {
		super()

		this.ip = ip
		this.output = new Subject()
		this.destination = new ReplaySubject()
	}

	private _resetState() {
		this.socket = undefined
		if (!this.source) {
			this.destination = new ReplaySubject()
		}
		this.output = new Subject()
	}

	private _connectSocket() {
		const observer = this.output

		let socket: Socket | undefined = undefined

		try {
			socket = new Socket()
			this.socket = socket
		} catch (e) {
			observer.error(e)
			return
		}

		const subscription = new Subscription(() => {
			this.socket = undefined
			if (socket && socket.writable) {
				socket.end()
			}
		})

		socket.on('connect', () => {
			const { socket: _socket } = this
			if (!_socket) {
				socket?.end()
				this._resetState()
				return
			}

			const queue = this.destination

			this.destination = Subscriber.create(
				x => {
					if (socket!.writable === true) {
						try {
							const payload = <number[]>Array.from(x!)
							payload.push(payload.reduce((a, b) => a + b, 0) % 0x100)
							socket!.write(Buffer.from(payload))
							debug(`>${this.ip}`, payload.map(int2Hex))
						} catch (e) {
							this.destination!.error(e)
						}
					}
				},
				e => {
					if (e && e.code) {
						socket!.end()
					} else {
						observer.error(new TypeError(INVALID_ERROR_OBJECT))
					}
					this._resetState()
				},
				() => {
					socket!.end()
					this._resetState()
				},
			) as Subscriber<any>

			if (queue && queue instanceof ReplaySubject) {
				subscription.add((<ReplaySubject<number[]>>queue).subscribe(this.destination))
			}
		})

		socket.on('error', e => {
			this._resetState()
			observer.error(e)
		})

		socket.on('close', e => {
			this._resetState()
			observer.complete()
		})

		socket.on('data', data => {
			debug(`<${this.ip}`, Array.from(data).map(int2Hex))
			try {
				observer.next(Array.from(data))
			} catch (err) {
				observer.error(err)
			}
		})

		socket.connect(5577, this.ip)
	}

	/** @deprecated This is an internal implementation detail, do not use. */
	_subscribe(subscriber: Subscriber<number[]>): Subscription {
		const { source } = this
		if (source) {
			return source.subscribe(subscriber)
		}
		if (!this.socket) {
			this._connectSocket()
		}
		this.output.subscribe(subscriber)
		subscriber.add(() => {
			const { socket: _socket } = this
			if (this.output.observers.length === 0) {
				if (_socket && _socket.writable) {
					_socket.end()
				}
				this._resetState()
			}
		})
		return subscriber
	}

	unsubscribe() {
		const { socket: _socket } = this
		if (_socket && _socket.writable) {
			_socket.end()
		}
		this._resetState()
		super.unsubscribe()
	}
}
