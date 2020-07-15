import BaseDriver from './BaseDriver'
import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export interface IStatus {
	on: boolean
	red: number
	green: number
	blue: number
	warm: number
	cool: number
}

export default class RgbCctDriver extends BaseDriver {
	public readonly statusObservable: Observable<IStatus>

	constructor(ip: string) {
		super(ip)

		this.statusObservable = this.ledenet.pipe(
			filter(values => values[0] === 0x81),
			map(this.parseStatus.bind(this)),
		)

		this.status().catch(console.error)
	}

	rgb(red: number, green: number, blue: number): Promise<number[]> {
		return this.write([0x31, red, green, blue, 0, 0, 0x00, 0x0f], 0x30)
	}

	rgbw(red: number, green: number, blue: number, warm: number, cool: number): Promise<number[]> {
		return this.write([0x31, red, green, blue, warm, cool, 0x00, 0x0f], 0x30)
	}

	cct(warm: number, cool: number): Promise<number[]> {
		return this.write([0x31, 0, 0, 0, warm, cool, 0xf, 0xf], 0x30)
	}

	status(): Promise<IStatus> {
		return this.write([0x81, 0x8a, 0x8b], 0x81).then(this.parseStatus.bind(this))
	}

	private parseStatus(status: number[]): IStatus {
		const [, , on, , , , red, green, blue, warm, , cool] = status
		return { on: on === 0x23, red, green, blue, warm, cool }
	}
}
