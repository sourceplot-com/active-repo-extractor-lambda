export function getTargetDatetime(): string {
	const now = new Date(Date.now() - 1000 * 60 * 60 * 2);
	const year = now.getUTCFullYear();
	const month = now.getUTCMonth() + 1;
	const day = now.getUTCDate();
	const hour = now.getUTCHours();

	return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}-${hour}`;
}
