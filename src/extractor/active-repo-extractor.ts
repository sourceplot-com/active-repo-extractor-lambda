export interface ActiveRepositoryData {
	readonly name: string;
}

export interface ActiveRepositoryExtractor {
	readonly name: string;
	getTodaysActiveRepositories(): Promise<ActiveRepositoryData[]>;
}