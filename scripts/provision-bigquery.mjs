#!/usr/bin/env node
/**
 * Creates the Clumsy Cheetah BigQuery dataset + tables.
 *
 * Sign in first as anita.sharma@clumsycheetah.in:
 *   gcloud auth login anita.sharma@clumsycheetah.in
 *   gcloud auth application-default login
 *   gcloud config set project <GCP_PROJECT_ID>
 *
 * Then:
 *   GCP_PROJECT_ID=your-project npm run bq:provision
 */
import { BigQuery } from "@google-cloud/bigquery";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const projectId = process.env.GCP_PROJECT_ID;
const datasetId = process.env.BIGQUERY_DATASET ?? "commerce";
const location = process.env.BIGQUERY_LOCATION ?? "asia-south1";
const expectedUser = "anita.sharma@clumsycheetah.in";

if (!projectId) {
  console.error("Set GCP_PROJECT_ID in .env.local (the Google Cloud project that anita.sharma@clumsycheetah.in can access).");
  process.exit(1);
}

const bigquery = new BigQuery({ projectId, location });

const ddlPath = resolve(process.cwd(), "bigquery/ddl/001_commerce.sql");
const sql = readFileSync(ddlPath, "utf8");

function splitStatements(source) {
  return source
    .split(/;\s*\n/)
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean)
    .map((s) => (s.endsWith(";") ? s : `${s};`));
}

const statements = splitStatements(sql).map((stmt) =>
  stmt.replaceAll("`commerce.", `\`${projectId}.${datasetId}.`).replace("CREATE SCHEMA IF NOT EXISTS `commerce`", `CREATE SCHEMA IF NOT EXISTS \`${projectId}.${datasetId}\``),
);

async function main() {
  console.log(`Account expected: ${expectedUser}`);
  console.log(`Project: ${projectId}`);
  console.log(`Dataset: ${datasetId} (${location})`);
  console.log(`Statements: ${statements.length}`);

  for (const [i, query] of statements.entries()) {
    const preview = query.replace(/\s+/g, " ").slice(0, 90);
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}… `);
    try {
      await bigquery.query({ query, location });
      console.log("ok");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/Already Exists/i.test(message)) {
        console.log("exists");
        continue;
      }
      console.error("\nFAILED\n", message);
      if (/Could not load the default credentials|UNAUTHENTICATED|invalid_grant/i.test(message)) {
        console.error(`\nSign in as ${expectedUser}:`);
        console.error("  gcloud auth login anita.sharma@clumsycheetah.in");
        console.error("  gcloud auth application-default login");
      }
      process.exit(1);
    }
  }

  const [tables] = await bigquery.dataset(datasetId).getTables();
  console.log(`\nCreated/verified ${tables.length} tables in ${projectId}.${datasetId}:`);
  for (const t of tables) console.log(`  - ${t.id}`);
}

main();
