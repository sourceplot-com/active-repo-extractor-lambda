#!/usr/bin/env tsx
import { handler } from "../src/main";
import type { Context } from "aws-lambda";

(async () => {
	await handler({}, {} as Context, () => {});
})();
