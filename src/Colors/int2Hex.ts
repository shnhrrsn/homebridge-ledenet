export default function int2Hex(num: number): string {
	return `0x${Number(num).toString(16).padStart(2, '0')}`
}
