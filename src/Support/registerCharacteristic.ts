import {
	Service,
	Characteristic,
	CharacteristicEventTypes,
	CharacteristicValue,
	CharacteristicGetCallback,
	CharacteristicSetCallback,
} from 'homebridge'
import exactlyOnce from './exactlyOnce'

export default function registerCharacteristic(
	service: Service,
	characteristic: any,
	{
		get,
		set,
	}: {
		get: (callback: CharacteristicGetCallback) => void
		set: (value: CharacteristicValue, callback: CharacteristicSetCallback) => void
	},
): Characteristic | undefined {
	const char = service.getCharacteristic(characteristic)
	if (!char) {
		return undefined
	}

	char.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
		get(exactlyOnce(callback))
	})

	char.on(
		CharacteristicEventTypes.SET,
		(value: CharacteristicValue, callback: CharacteristicSetCallback) => {
			set(value, exactlyOnce(callback))
		},
	)

	return char
}
