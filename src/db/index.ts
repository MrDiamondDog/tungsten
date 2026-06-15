import { createClient } from "@libsql/client/node";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql/node";

const client = createClient({ url: process.env.DB_FILE_NAME! });
const db = drizzle(client);
