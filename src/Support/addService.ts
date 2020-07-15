import { PlatformAccessory, Service } from 'homebridge'

export default function addService(
	platformAccessory: PlatformAccessory,
	service: Service | typeof Service,
	...constructorArgs: any[]
): Service {
	return platformAccessory.addService(service, ...constructorArgs)
}
