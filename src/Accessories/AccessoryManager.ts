import { API, Logging, PlatformAccessory } from 'homebridge'
import { platformName, pluginName } from '../settings'

import { Accessory } from './Accessory'
import { IAccessoryConfig } from '../IAccessoryConfig'
import { IConfig } from '../IConfig'
import Platform from '../Platform'

export default class AccessoryManager {
	log: Logging
	config?: IConfig
	api: API
	registry: Map<string, Accessory>
	restorableAccessories: Map<string, PlatformAccessory>

	constructor(platform: Platform) {
		this.log = platform.log
		this.config = platform.config
		this.api = platform.api
		this.registry = new Map()
		this.restorableAccessories = new Map()
	}

	start() {
		for (const accessory of this.config?.accessories ?? []) {
			this.makeAccessory(accessory)
		}
	}

	purge() {
		for (const accessory in this.restorableAccessories.values()) {
			this.removeAccessory(accessory)
		}
	}

	restoreAccessory(accessory: PlatformAccessory) {
		this.restorableAccessories.set(accessory.UUID, accessory)
	}

	removeAccessory(accessoryId: string) {
		const accessory =
			this.restorableAccessories.get(accessoryId) ??
			this.registry.get(accessoryId)?.platformAccessory

		if (!accessory) {
			return
		}

		this.api.unregisterPlatformAccessories(pluginName, platformName, [accessory])
		this.restorableAccessories.delete(accessoryId)
		this.registry.delete(accessoryId)
	}

	configToAccessoryId(config: IAccessoryConfig): string {
		return this.api.hap.uuid.generate(config.ip)
	}

	private makeAccessory(config: IAccessoryConfig): Accessory {
		const accessoryId = this.configToAccessoryId(config)
		let accessory = this.registry.get(accessoryId)

		if (accessory) {
			return accessory
		}

		const platformAccessory =
			this.restorableAccessories.get(accessoryId) ||
			new this.api.platformAccessory(this.getInitialNodeName(config), accessoryId)

		accessory = new Accessory(this.log, this.api, platformAccessory, config)
		accessory.configure()

		if (!this.restorableAccessories.delete(accessoryId)) {
			this.api.registerPlatformAccessories(pluginName, platformName, [
				accessory.platformAccessory,
			])
		}

		this.registry.set(accessoryId, accessory)

		return accessory
	}

	private getInitialNodeName(config: IAccessoryConfig): string {
		if (config.name) {
			return config.name
		}

		return `LED ${config.ip}`
	}
}
