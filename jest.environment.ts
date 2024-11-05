// jest.environment.ts
import { redis } from "./src/config/index";
import { getTestKnex, cleanupTestDb } from "./tests/setupTestDb";

beforeAll(async () => {
  const testKnex = await getTestKnex();
  await testKnex.migrate.latest();
});

beforeEach(async () => {
  await redis.flushall();
  await cleanupTestDb();
});

afterAll(async () => {
  await redis.flushall();
  await redis.quit();
});