import postgres from "postgres";

export const client = postgres(
  "postgres://postgres.phycoxmvfbhhzsonkgbq:pavanocta123@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
);
