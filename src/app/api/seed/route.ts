import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  if (!db) {
    return new Response("Database connection not initialized", { status: 500 });
  }

  const records = await db
    .insert(advocates)
    .values(advocateData)
    .onConflictDoNothing() // prevent duplicates from seeding
    .returning();

  return Response.json({ advocates: records });
}

