import { IConfig } from './IConfig'
import { Logging, API, DynamicPlatformPlugin, PlatformAccessory, PlatformConfig } from 'homebridge'
import AccessoryManager from './Accessories/AccessoryManager'

export default class Platform implements DynamicPlatformPlugin {
	log: Logging
	config?: IConfig
	api: API
	accessoryManager: AccessoryManager

	constructor(log: Logging, config: PlatformConfig, api: API) {
		this.log = log
		this.config = config as IConfig
		this.api = api
		this.accessoryManager = new AccessoryManager(this)

		if (!config) {
			this.log.warn('A config.json entry is required. Aborting.')
		} else {
			this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this))
		}
	}

	private didFinishLaunching() {
		if ((this.config?.accessories?.length ?? 0) === 0) {
			this.log.error('Platform unavailable, missing accessories in config.')
			return
		}

		this.accessoryManager.start()
		this.accessoryManager.purge()
	}

	configureAccessory(accessory: PlatformAccessory): void {
		this.accessoryManager.restoreAccessory(accessory)
	}
}
