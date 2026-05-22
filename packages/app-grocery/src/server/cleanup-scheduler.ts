import { Bunqueue } from "bunqueue/client";
import type { GroceryItemId } from "../shared/index.ts";
import type { GroceryService } from "./service.ts";

export const PURCHASED_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const QUEUE_NAME = "grocery-cleanup";
const JOB_NAME = "delete-purchased";

const jobIdFor = (itemId: GroceryItemId): string => `cleanup:${itemId}`;

export type CleanupJobData = { itemId: GroceryItemId };

export type CleanupScheduler = {
  schedule(itemId: GroceryItemId): Promise<void>;
  cancel(itemId: GroceryItemId): Promise<void>;
  close(): Promise<void>;
};

export type CleanupOptions = {
  service: GroceryService;
  dataPath: string;
  ttlMs?: number;
};

export const createCleanupScheduler = (opts: CleanupOptions): CleanupScheduler => {
  const ttl = opts.ttlMs ?? PURCHASED_TTL_MS;

  const bq = new Bunqueue<CleanupJobData>(QUEUE_NAME, {
    embedded: true,
    dataPath: opts.dataPath,
    concurrency: 1,
    processor: async (job) => {
      const result = await opts.service.remove(job.data.itemId);
      if (result.kind === "err" && result.error.kind !== "not_found") {
        throw new Error(`cleanup failed: ${result.error.kind}`);
      }
    },
  });

  return {
    async schedule(itemId) {
      await bq.add(
        JOB_NAME,
        { itemId },
        {
          delay: ttl,
          jobId: jobIdFor(itemId),
          removeOnComplete: true,
          removeOnFail: { age: 14 * 24 * 60 * 60 * 1000 },
        },
      );
    },
    async cancel(itemId) {
      const id = jobIdFor(itemId);
      const job = await bq.getJob(id);
      if (job !== null) {
        await job.remove();
      }
    },
    async close() {
      await bq.close();
    },
  };
};
