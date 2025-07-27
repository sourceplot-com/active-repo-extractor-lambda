declare global {
	namespace NodeJS {
		interface ProcessEnv {
			ACTIVE_REPO_QUEUE_NAME: string | undefined;
			ACTIVE_REPO_QUEUE_URL: string | undefined;
			ACTIVE_REPOSITORIES_PER_MESSAGE: string | undefined;
		}
	}
}

export {};
