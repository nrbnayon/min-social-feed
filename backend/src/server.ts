import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const start = async () => {
  await connectDatabase();
  app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
};

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
