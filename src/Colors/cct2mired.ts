import Cct from './Cct'
import { ICctConfig } from '../IAccessoryConfig'
import kelvin2mired from './kelvin2mired'

export default function cct2mired(cct: Cct, { warmTemp, coolTemp }: ICctConfig): number {
	return kelvin2mired(warmTemp + (coolTemp - warmTemp) * (cct.cool / 255))
}
