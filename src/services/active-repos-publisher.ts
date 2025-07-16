import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { env } from "~/env/env.js";
import { chunk } from "~/utils/batch.js";
import { getTargetDatetime } from "~/utils/time.js";

export interface ActiveRepositoryData {
	name: string;
}

export interface ActiveRepositoriesPayload {
	timestamp: string;
	repositories: ActiveRepositoryData[];
}

export class ActiveRepositoriesPublisher {
	private static readonly MAX_SQS_BATCH_SIZE = 10;
	private static readonly MAX_REPOSITORIES_PER_PAYLOAD = 500;

	private readonly sqsClient: SQSClient;

	constructor() {
		this.sqsClient = new SQSClient({});
	}

	async submit(activeRepositories: ActiveRepositoryData[]) {
		const payloads: ActiveRepositoriesPayload[] = chunk(activeRepositories, ActiveRepositoriesPublisher.MAX_REPOSITORIES_PER_PAYLOAD).map(
			(repositories) => ({
				timestamp: getTargetDatetime(),
				repositories
			})
		);

		const payloadBatches = chunk(payloads, ActiveRepositoriesPublisher.MAX_SQS_BATCH_SIZE);
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
