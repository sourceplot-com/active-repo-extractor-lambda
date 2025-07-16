import { ActiveRepositoriesPublisher } from "./services/active-repos-publisher.js";
import { GhArchiveService } from "./services/gharchive-service.js";
import type { Context, Handler } from "aws-lambda";

export const handler: Handler = async (event: object, context: Context) => {
	console.log(`Received invocation with event: ${JSON.stringify(event)}`);

	const ghArchiveService = new GhArchiveService();
	const activeRepositories = await ghArchiveService.getTodaysActiveRepositories();
	console.log(`Found ${activeRepositories.length} active repositories`);

	const activeRepositoriesPublisher = new ActiveRepositoriesPublisher();
	await activeRepositoriesPublisher.submit(activeRepositories);
};
