import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/curator_crm";

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

export * from "./schema";
