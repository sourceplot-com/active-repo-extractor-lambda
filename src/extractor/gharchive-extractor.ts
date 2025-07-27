import type { Octokit } from "@octokit/rest";
import axios from "axios";
import readline from "node:readline";
import { createGunzip } from "zlib";
import { getTargetDatetime } from "~/utils/time.js";
import { ActiveRepositoryData, ActiveRepositoryExtractor } from "./active-repo-extractor.js";

export type GetEventsResponse = Awaited<ReturnType<typeof Octokit.prototype.request<"GET /events">>>["data"];
export type GitHubEvent = GetEventsResponse[0];

const ACTIVE_EVENT_TYPES = ["PushEvent", "CreateEvent"];

export class GhArchiveActiveRepoExtractor implements ActiveRepositoryExtractor {
	readonly name = "gharchive";

	async getTodaysActiveRepositories(): Promise<ActiveRepositoryData[]> {
		const gunzip = createGunzip();

		const data = await this.getArchiveDataStream();
		const rl = readline.createInterface({
			input: data.pipe(gunzip),
			crlfDelay: Infinity
		});

		let totalEvents = 0;

		const repositoryByName = new Map<string, ActiveRepositoryData>();
		for await (const line of rl) {
			const event: GitHubEvent = JSON.parse(line);
			if (event.type && ACTIVE_EVENT_TYPES.includes(event.type)) {
				repositoryByName.set(event.repo.name, { name: event.repo.name });
			}

			totalEvents++;
		}

		console.log(`Found ${totalEvents} events, ${repositoryByName.size} of which are active repositories`);
		return Array.from(repositoryByName.values());
	}

	private async getArchiveDataStream() {
		const gharchiveUrl = this.buildTargetUrl();
		console.log(`Fetching events from ${gharchiveUrl}`);

		const { status, data } = await axios.get(gharchiveUrl, { responseType: "stream", decompress: false });
		if (status !== 200) {
			throw new Error(`Failed to fetch events from ${gharchiveUrl}. Status: ${status}`);
		}

		return data;
	}

	private buildTargetUrl(): string {
		return `https://data.gharchive.org/${getTargetDatetime()}.json.gz`;
	}
}
