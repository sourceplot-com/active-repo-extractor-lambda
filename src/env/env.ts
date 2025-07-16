const activeRepoQueueUrl = process.env.ACTIVE_REPO_QUEUE_URL;
if (!activeRepoQueueUrl) {
	throw new Error("ACTIVE_REPO_QUEUE_URL environment variable is required");
}

const activeRepoQueueName = process.env.ACTIVE_REPO_QUEUE_NAME;
if (!activeRepoQueueName) {
	throw new Error("ACTIVE_REPO_QUEUE_NAME environment variable is required");
}

export const env = {
	activeRepoQueueUrl,
	activeRepoQueueName
};
