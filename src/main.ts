import { ActiveRepositoryData } from "./extractor/active-repo-extractor.js";
import { GhArchiveActiveRepoExtractor } from "./extractor/gharchive-extractor.js";
import { ActiveRepositoryPublisher } from "./publisher/active-repo-publisher.js";
import { ActiveRepoSqsPublisher } from "./publisher/sqs-publisher.js";
import type { Context, Handler } from "aws-lambda";

export const handler: Handler = async (event: object, context: Context) => {
	console.log(`Received invocation with event: ${JSON.stringify(event)}`);

	const activeRepositories = await extractActiveRepositories();
	await submitActiveRepositories(activeRepositories);
};

async function extractActiveRepositories(): Promise<ActiveRepositoryData[]> {
	const extractors = [new GhArchiveActiveRepoExtractor()];
	console.log(`Using ${extractors.length} extractors: ${extractors.map((extractor) => extractor.name).join(", ")}`);

	const activeRepositories = (await Promise.all(extractors.map((extractor) => extractor.getTodaysActiveRepositories()))).flat();
	console.log(`Found ${activeRepositories.length} active repositories`);

	return activeRepositories;
}

async function submitActiveRepositories(activeRepositories: ActiveRepositoryData[]) {
	const publisher: ActiveRepositoryPublisher = new ActiveRepoSqsPublisher();
	await publisher.submit(activeRepositories);
	console.log(`Successfully submitted ${activeRepositories.length} active repositories`);
}
