export function chunk<T>(array: T[], chunkSize: number): T[][] {
	return array.reduce((acc, item, index) => {
		const chunkIndex = Math.floor(index / chunkSize);

		acc[chunkIndex] ??= [];
		acc[chunkIndex].push(item);

		return acc;
	}, [] as T[][]);
}
