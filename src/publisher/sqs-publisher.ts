import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { env } from "~/env/env.js";
import { ActiveRepositoryData } from "../extractor/active-repo-extractor.js";
import { chunk } from "~/utils/batch.js";
import { ActiveRepositoryPublisher, ActiveRepositoriesPayload } from "./active-repo-publisher.js";

export class ActiveRepoSqsPublisher implements ActiveRepositoryPublisher {
	private static readonly MAX_SQS_BATCH_SIZE = 10;

	private readonly sqsClient: SQSClient;

	constructor() {
		this.sqsClient = new SQSClient({});
	}

	async submit(activeRepositories: ActiveRepositoryData[]) {
		const payloads: ActiveRepositoriesPayload[] = chunk(activeRepositories, env.activeRepositoriesPerMessage).map(
			(repositories) => ({
				timestamp: new Date().toUTCString(),
				repositories
			})
		);

		const payloadBatches = chunk(payloads, ActiveRepoSqsPublisher.MAX_SQS_BATCH_SIZE);
		console.log(`Sending ${payloadBatches.length} payload batches, containing ${activeRepositories.length} total repositories`);

		await Promise.all(payloadBatches.map((batch) => this.sendPayloadBatch(batch)));
	}

	private async sendPayloadBatch(payloads: ActiveRepositoriesPayload[]): Promise<void> {
		const totalRepos = payloads.reduce((acc, payload) => acc + payload.repositories.length, 0);
		console.log(`Sending payload batch of ${payloads.length} payloads, containing ${totalRepos} total repositories`);

		await this.sqsClient.send(
			new SendMessageBatchCommand({
				QueueUrl: env.activeRepoQueueUrl,
				Entries: payloads.map((payload, index) => ({
					Id: `payload-${Date.now()}-${index}`,
					MessageBody: JSON.stringify(payload)
				}))
			})
		);
	}
}
