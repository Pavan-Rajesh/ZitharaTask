import postgres from "postgres";

export const client = postgres(process.env.DATABASE_URL);
