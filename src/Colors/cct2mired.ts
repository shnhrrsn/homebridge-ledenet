import CCT from './CCT'
import kelvin2mired from './kelvin2mired'

export default function cct2mired(cct: CCT, warmTemp: number, coolTemp: number): number {
	return kelvin2mired(warmTemp + (coolTemp - warmTemp) * (cct.cool / 255))
}
