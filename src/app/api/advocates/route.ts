import { ilike, or, sql } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { PgSelectBase } from "drizzle-orm/postgres-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  let searchTerm = url.searchParams.get("search")?.trim() || ""; // Trimming the search term here
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = Number(url.searchParams.get("pageSize")) || 20;

  if (!db) {
    return new Response("Database connection not initialized", { status: 500 });
  }

  try {
    let query = db.select().from(advocates) as PgSelectBase<"advocates", any, any>;

    if (searchTerm) {
      query = db
        .select()
        .from(advocates)
        .where(
          or(
            ilike(advocates.firstName, `%${searchTerm}%`),
            ilike(advocates.lastName, `%${searchTerm}%`),
            ilike(advocates.city, `%${searchTerm}%`),
            ilike(advocates.degree, `%${searchTerm}%`),
            sql`EXISTS (
                  SELECT 1 
                  FROM jsonb_array_elements_text(${advocates.specialties}) AS tag 
                  WHERE tag ILIKE ${`%${searchTerm}%`}
                )`
          )
        );
    }

    const data = await query.limit(pageSize).offset((page - 1) * pageSize);

    return Response.json({ data });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

