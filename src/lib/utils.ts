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
