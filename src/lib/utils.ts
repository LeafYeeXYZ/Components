/**
 * Debounces a function call, ensuring that the function is not called again until a specified delay has passed since the last call.
 * @param fn The function to debounce
 * @param delay The delay in milliseconds to wait before calling the function again, default is 100ms
 * @returns A debounced version of the function that can be called with the same parameters as the original function
 */
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
