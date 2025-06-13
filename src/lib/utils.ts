export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay = 100,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null

	return (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
		timeoutId = setTimeout(() => {
			fn(...args)
		}, delay)
	}
}

export function randomId(length = 8): string {
	return Math.random()
		.toString(36)
		.slice(2, length + 2)
}
