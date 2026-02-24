const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

async function resetAndSeed() {
  try {
    console.log("Dropping all tables...");
    await execAsync("ts-node seed.ts --truncate-only");

    console.log("Running migrations...");
    await execAsync("npm run migration:run");
    console.log("Migrations applied");

    console.log("Seeding database...");
    await execAsync("ts-node seed.ts");
    console.log("Seed complete!");
  } catch (err) {
    console.error("Reset and seed failed:", err);
    process.exit(1);
  }
}

resetAndSeed();
