import { PlatformAccessory, Service, WithUUID } from 'homebridge'
import addService from './addService'

export default function getService<T extends WithUUID<typeof Service>>(
	platformAccessory: PlatformAccessory,
	serviceType: string | T,
	createAutomatically = true,
): Service | undefined {
	const service = platformAccessory.getService(serviceType)

	if (service) {
		return service
	}

	if (!createAutomatically || typeof serviceType === 'string') {
		return undefined
	}

	return addService(platformAccessory, serviceType)
}
