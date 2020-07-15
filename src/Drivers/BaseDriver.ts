import { filter, first } from 'rxjs/operators'

import LedenetSubject from '../Support/LedenetSubject'

export default class BaseDriver {
	public ledenet: LedenetSubject

	constructor(ip: string) {
		this.ledenet = new LedenetSubject(ip)
	}

	on(): Promise<number[]> {
		return this.write([0x71, 0x23, 0x0f], [0x71, 0x23])
	}

	off(): Promise<number[]> {
		return this.write([0x71, 0x24, 0x0f], [0x71, 0x24])
	}

	write(
		payload: number[],
		responseFilter: number | [number, number] | ((value: number[]) => boolean),
	): Promise<number[]> {
		let _filter: (value: number[]) => boolean

		if (typeof responseFilter === 'number') {
			const number = responseFilter
			_filter = value => value[0] === number
		} else if (Array.isArray(responseFilter)) {
			const numbers = responseFilter
			_filter = value => value[0] === numbers[0] && value[1] === numbers[1]
		} else {
			_filter = responseFilter
		}

		return new Promise(resolve => {
			this.ledenet
				.pipe(
					filter(values => _filter(values[0] !== 0xf0 ? values : values.slice(1))),
					first(),
				)
				.subscribe(values => {
					if (values[0] === 0xf0) {
						// Byte that sometypes gets prepended, unclear if it means ack or error
						values = values.slice(1)
					}

					resolve(values)
				})
			this.ledenet.next(payload)
		})
	}
}
