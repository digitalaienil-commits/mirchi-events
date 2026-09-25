// Database and admin-account commands. Reads DATABASE_URL from the environment, .env.local or .env.
//
//   npm run db:migrate                     apply new files in db/migrations
//   npm run db:seed                        add starter categories + events (only if there are no events)
//   npm run admin:create -- <email> [pw]   create an admin, or reset their password
//   npm run admin:remove -- <email>
//   npm run admin:list

import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const root = path.resolve(import.meta.dirname, "..");

// Same precedence as Next.js: real env vars, then .env.local, then .env.
for (const file of [".env.local", ".env"]) {
  if (existsSync(path.join(root, file))) process.loadEnvFile(path.join(root, file));
}
const [command, ...args] = process.argv.slice(2);

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

// Must match hashPassword in lib/password.ts.
function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set. Add it to .env.local (see .env.example).");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  switch (command) {
    case "migrate": {
      await client.query(
        "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
      );
      const { rows } = await client.query("select name from schema_migrations");
      const applied = new Set(rows.map((r) => r.name));
      const dir = path.join(root, "db/migrations");
      const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

      let count = 0;
      for (const file of files) {
        if (applied.has(file)) continue;
        await client.query("begin");
        try {
          await client.query(readFileSync(path.join(dir, file), "utf8"));
          await client.query("insert into schema_migrations (name) values ($1)", [file]);
          await client.query("commit");
        } catch (error) {
          await client.query("rollback");
          fail(`${file} failed: ${error.message}`);
        }
        console.log(`✔ applied ${file}`);
        count++;
      }
      console.log(count ? `Done. ${count} migration(s) applied.` : "Database is already up to date.");
      break;
    }

    case "seed": {
      const { rows } = await client.query("select count(*)::int as n from events");
      if (rows[0].n > 0) {
        console.log(`Skipped: the database already has ${rows[0].n} event(s).`);
        break;
      }
      await client.query(readFileSync(path.join(root, "db/seed.sql"), "utf8"));
      console.log("✔ Added starter categories and events.");
      break;
    }

    case "create-admin": {
      const email = args[0]?.trim().toLowerCase();
      if (!email || !email.includes("@")) fail("Usage: npm run admin:create -- <email> [password]");
      const generated = !args[1];
      const password = args[1] ?? randomBytes(12).toString("base64url");
      if (password.length < 10) fail("Password must be at least 10 characters.");

      const { rows } = await client.query(
        `insert into admins (email, password_hash) values ($1, $2)
         on conflict (email) do update set password_hash = excluded.password_hash
         returning (xmax = 0) as created`,
        [email, hashPassword(password)],
      );
      console.log(`✔ ${rows[0].created ? "Created admin" : "Reset password for"} ${email}`);
      if (generated) console.log(`  Password: ${password}\n  (shown once, so share it securely)`);
      break;
    }

    case "remove-admin": {
      const email = args[0]?.trim().toLowerCase();
      if (!email) fail("Usage: npm run admin:remove -- <email>");
      const { rowCount } = await client.query("delete from admins where email = $1", [email]);
      console.log(rowCount ? `✔ Removed ${email}` : `No admin with email ${email}`);
      break;
    }

    case "list-admins": {
      const { rows } = await client.query("select email, last_login_at from admins order by email");
      if (!rows.length) console.log("No admins yet. Create one with: npm run admin:create -- you@example.com");
      for (const r of rows) {
        console.log(`${r.email}  (last login: ${r.last_login_at ? r.last_login_at.toISOString() : "never"})`);
      }
      break;
    }

    default:
      fail("Unknown command. Use: migrate | seed | create-admin | remove-admin | list-admins");
  }
} finally {
  await client.end();
}
