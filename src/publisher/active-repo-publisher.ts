import { ActiveRepositoryData } from "../extractor/active-repo-extractor.js";

export interface ActiveRepositoriesPayload {
	readonly timestamp: string;
	readonly repositories: ActiveRepositoryData[];
}

export interface ActiveRepositoryPublisher {
	submit(activeRepositories: ActiveRepositoryData[]): Promise<void>;
}
