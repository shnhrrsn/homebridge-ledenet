import { API, Logging, PlatformAccessory, Service } from 'homebridge'
import {
	Characteristic,
	CharacteristicGetCallback,
	CharacteristicSetCallback,
	CharacteristicValue,
} from 'homebridge'
import { IAccessoryConfig, ICctConfig } from '../IAccessoryConfig'
import RgbCctDriver, { IStatus } from '../Drivers/RgbCctDriver'

import Cct from '../Colors/Cct'
import cct2mired from '../Colors/cct2mired'
import chalk from 'chalk'
import getService from '../Support/getService'
import hsb2rgb from '../Colors/hsb2rgb'
import kelvin2mired from '../Colors/kelvin2mired'
import mired2Cct from '../Colors/mired2Cct'
import registerCharacteristic from '../Support/registerCharacteristic'
import rgb2hsb from '../Colors/rgb2hsb'

type HSB = [number, number, number]

enum Mode {
	HSB = 'HSB',
	CCT = 'CCT',
}

export class Accessory {
	platformAccessory: PlatformAccessory
	api: API
	log: Logging
	config: IAccessoryConfig
	driver: RgbCctDriver
	private mode = Mode.HSB
	private hsb?: HSB
	private cct?: Cct
	private powerState?: Characteristic
	private hue?: Characteristic
	private saturation?: Characteristic
	private brightness?: Characteristic
	private colorTemp?: Characteristic
	private readonly cctConfig: ICctConfig

	constructor(
		log: Logging,
		api: API,
		platformAccessory: PlatformAccessory,
		config: IAccessoryConfig,
	) {
		this.log = log
		this.api = api
		this.platformAccessory = platformAccessory
		this.config = config
		this.driver = new RgbCctDriver(config.ip)
		this.cctConfig = Object.freeze({
			warmTemp: config?.cct?.warmTemp ?? 3000,
			coolTemp: config?.cct?.coolTemp ?? 6000,
		})
	}

	configure() {
		const { Service, Characteristic } = this.api.hap
		const infoService = getService(this.platformAccessory, Service.AccessoryInformation, false)

		if (infoService) {
			this.configureInfoService(infoService)
		}

		const service = getService(this.platformAccessory, Service.Lightbulb)
		if (!service) {
			this.log.error('Could not create lightbulb', this.config.ip)
			return
		}

		this.driver.statusObservable.subscribe(this.onStatus.bind(this))

		this.powerState = registerCharacteristic(service, Characteristic.On, {
			get: this.getPowerState.bind(this),
			set: this.setPowerState.bind(this),
		})

		service.addOptionalCharacteristic(Characteristic.ColorTemperature)
		this.colorTemp = registerCharacteristic(service, Characteristic.ColorTemperature, {
			get: this.getColorTemperature.bind(this),
			set: this.setColorTemperature.bind(this),
		})

		this.colorTemp?.setProps({
			maxValue: kelvin2mired(this.cctConfig.warmTemp),
			minValue: kelvin2mired(this.cctConfig.coolTemp),
		})

		this.hue = registerCharacteristic(service, Characteristic.Hue, {
			get: this.getHue.bind(this),
			set: this.setHue.bind(this),
		})

		this.saturation = registerCharacteristic(service, Characteristic.Saturation, {
			get: this.getSat.bind(this),
			set: this.setSat.bind(this),
		})

		this.brightness = registerCharacteristic(service, Characteristic.Brightness, {
			get: this.getBrightness.bind(this),
			set: this.setBrightness.bind(this),
		})

		this.log.info('Done', this.config.ip)
	}

	private configureInfoService(infoService: Service) {
		const { Characteristic } = this.api.hap
		infoService.setCharacteristic(Characteristic.Manufacturer, 'LEDE')
		infoService.setCharacteristic(Characteristic.Model, 'LEDE')
		infoService.setCharacteristic(Characteristic.SerialNumber, this.config.ip)
	}

	private getPowerState(callback: CharacteristicGetCallback) {
		this.driver
			.status()
			.then(({ on }) => callback(undefined, on))
			.catch(error => callback(error))
	}

	private setPowerState(value: CharacteristicValue, callback: CharacteristicSetCallback) {
		this.log.debug(value ? 'turn on' : 'turn off')
		const promise = value ? this.driver.on() : this.driver.off()
		promise.then(() => callback()).catch(error => callback(error))
	}

	private getColorTemperature(callback: CharacteristicGetCallback) {
		if (!this.cct) {
			callback(new Error('Unavailable'))
			return
		}

		callback(undefined, cct2mired(this.cct, this.cctConfig))
	}

	private setColorTemperature(value: CharacteristicValue, callback: CharacteristicSetCallback) {
		this.setCct(mired2Cct(Number(value), this.cctConfig), callback)
	}

	private getHue(callback: CharacteristicGetCallback) {
		callback(undefined, this.hsb?.[0] ?? 0)
	}

	private setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {
		if (!this.hsb) {
			callback()
			return
		}

		this.setHsb([Number(value), this.hsb[1], this.hsb[2]], callback)
	}

	private getSat(callback: CharacteristicGetCallback) {
		callback(undefined, this.hsb?.[1] ?? 0)
	}

	private setSat(value: CharacteristicValue, callback: CharacteristicSetCallback) {
		if (!this.hsb) {
			callback()
			return
		}

		this.setHsb([this.hsb[0], Number(value), this.hsb[2]], callback)
	}

	private getBrightness(callback: CharacteristicGetCallback) {
		callback(undefined, this.hsb?.[2] ?? 1)
	}

	private setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
		if (!this.hsb) {
			callback()
			return
		}

		this.hsb[2] = Math.min(100, Math.max(1, Number(value)))

		console.log('value', this.hsb[2])
		if (this.mode === Mode.HSB) {
			this.setHsb([...this.hsb], callback)
		} else if (this.cct) {
			this.setCct(this.cct, callback)
		}
	}

	private setHsb([hue, sat, brightness]: HSB, callback: CharacteristicSetCallback) {
		const [red, green, blue] = hsb2rgb([hue, sat, brightness])
		this.hsb = [hue, sat, brightness]
		this.mode = Mode.HSB
		this.log.debug(
			'setting color',
			chalk.rgb(red, green, blue)(`rgb:${red},${green},${blue}`),
			chalk.hsv(hue, sat, brightness)(`hsb:${hue},${sat},${Math.round(brightness)}`),
		)

		this.driver
			.rgbw(red, green, blue, 0, 0)
			.then(() => callback())
			.catch(error => callback(error))
	}

	private setCct(
		{ warm, cool }: { warm: number; cool: number },
		callback: CharacteristicSetCallback,
	) {
		this.cct = { cool, warm }
		this.mode = Mode.CCT
		const brightness = this.effectiveBrightness / 100.0
		this.log.debug('setting temperature', { cool, warm, brightness })
		this.driver
			.rgbw(0, 0, 0, Math.round(warm * brightness), Math.round(cool * brightness))
			.then(() => callback())
			.catch(error => callback(error))
		callback()
	}

	private onStatus(status: IStatus) {
		this.mode = status.warm > 0 || status.cool > 0 ? Mode.CCT : Mode.HSB
		this.powerState?.updateValue(status.on)

		this.hsb = rgb2hsb([status.red, status.green, status.blue])
		this.hue?.updateValue(this.hsb[0])
		this.saturation?.updateValue(this.hsb[1])

		const white = status.warm + status.cool

		if (white > 0) {
			this.hsb[2] = Math.min(100, Math.max(0, (100 * white) / 255))
			const warm = Math.round(255 * (status.warm / white))

			this.cct = {
				warm: warm,
				cool: 255 - warm,
			}
			this.colorTemp?.updateValue(cct2mired(this.cct, this.cctConfig))
		} else {
			this.cct = { warm: 255, cool: 0 }
		}

		if (this.hsb[2] <= 0) {
			this.hsb[2] = 100
		}

		this.brightness?.updateValue(this.hsb[2])
		this.log.debug('received status', {
			raw: status,
			parsed: { mode: this.mode, hsb: this.hsb, cct: this.cct },
		})
	}

	private get effectiveBrightness() {
		return Math.max(1, this.hsb?.[2] ?? 50)
	}
}
