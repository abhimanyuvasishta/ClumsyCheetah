/**
 * Creates local test Auth users (customer, vendor, order manager).
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 *   TEST_USER_PASSWORD='ClumsyLocal1!' npm run seed:test-users
 */
import { createClient } from "@supabase/supabase-js";
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.TEST_USER_PASSWORD;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!password || password.length < 8) {
  console.error("Set TEST_USER_PASSWORD (min 8 characters) in the environment or .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  { email: "customer@clumsycheetah.local", role: "CUSTOMER", name: "Test Customer" },
  { email: "vendor@clumsycheetah.local", role: "ADMIN", name: "Test Vendor" },
  { email: "orders@clumsycheetah.local", role: "ORDER_MANAGER", name: "Test Order Manager" },
];

async function upsertUser(email, name) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (!error && created.user) return created.user.id;

  const msg = error?.message ?? "";
  if (!msg.toLowerCase().includes("already") && error?.status !== 422) {
    throw error;
  }

  const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw new Error(`Could not find existing user ${email}`);
  const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (updateError) throw updateError;
  return existing.id;
}

for (const account of accounts) {
  const userId = await upsertUser(account.email, account.name);
  const { error: roleError } = await admin.from("user_roles").upsert(
    { user_id: userId, role: account.role, revoked_at: null },
    { onConflict: "user_id,role" },
  );
  if (roleError) {
    console.error(`User ${account.email} created but role failed:`, roleError.message);
    console.error("Apply supabase/migrations first, then re-run this script.");
    process.exit(1);
  }
  console.log(`OK  ${account.email}  →  ${account.role}  (${userId})`);
}

console.log("\nPassword is TEST_USER_PASSWORD from your env (not stored in git).");
console.log("Customer:  http://localhost:3000/login");
console.log("Vendor:    http://localhost:3000/login?next=/admin");
console.log("Orders:    http://localhost:3000/login?next=/admin/orders");
