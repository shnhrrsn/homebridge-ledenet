export interface IAccessoryConfig {
	name?: string
	ip: string
	cct?: Partial<ICctConfig>
}

export interface ICctConfig {
	readonly warmTemp: number // Default: 3000
	readonly coolTemp: number // Default: 6000
}
