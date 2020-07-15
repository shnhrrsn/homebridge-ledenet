import CCT from './CCT'
import mired2kelvin from './mired2kelvin'

export default function mired2cct(mired: number, warmTemp: number, coolTemp: number): CCT {
	const kelvin = Math.min(Math.max(mired2kelvin(mired), warmTemp), coolTemp)
	const percentage = (kelvin - warmTemp) / (coolTemp - warmTemp)
	const cool = Math.round(255 * percentage)
	const warm = 255 - cool
	return { cool, warm }
}
