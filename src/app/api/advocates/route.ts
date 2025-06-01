import { ilike, or, sql, } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";

// Simple in-memory idempotency cache (for demonstration; use Redis for production)
const searchCache = new Map<string, { timestamp: number, response: any }>();
const CACHE_TTL_MS = 10_000; // 10 seconds

function makeCacheKey(searchTerm: string, page: number, pageSize: number) {
  return `${searchTerm}|${page}|${pageSize}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchTerm = url.searchParams.get("search")?.trim() || ""; // Trimming the search term here
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = Number(url.searchParams.get("pageSize")) || 20;

  // Idempotency key
  const cacheKey = makeCacheKey(searchTerm, page, pageSize);
  const now = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return Response.json(cached.response);
  }

  if (!db) {
    return new Response("Database connection not initialized", { status: 500 });
  }

  try {
    const query = searchTerm
      ? db
          .select()
          .from(advocates)
          .where(
            or(
              // Full-text search (tsvector)
              sql`search_vector @@ plainto_tsquery('english', ${searchTerm})`,

              // Trigram similarity (pg_trgm) and substring search
              sql`similarity(first_name, ${searchTerm}) > 0.3`,
              sql`similarity(last_name, ${searchTerm}) > 0.3`,
              sql`similarity(city, ${searchTerm}) > 0.3`,
              sql`similarity(degree, ${searchTerm}) > 0.3`,
              sql`similarity(specialties_text, ${searchTerm}) > 0.3`,

              // Substring search for completeness (ILIKE, now index-backed by pg_trgm)
              sql`first_name ILIKE ${`%${searchTerm}%`}`,
              sql`last_name ILIKE ${`%${searchTerm}%`}`,
              sql`city ILIKE ${`%${searchTerm}%`}`,
              sql`degree ILIKE ${`%${searchTerm}%`}`,
              sql`(first_name || ' ' || last_name) ILIKE ${`%${searchTerm}%`}`,
              sql`EXISTS (
                    SELECT 1 
                    FROM jsonb_array_elements_text(specialties) AS tag 
                    WHERE replace(tag, '''', '') ILIKE ${`%${searchTerm.replace(/'/g, '')}%`}
                  )`
            )
          )
      : db.select().from(advocates);

    const data = await query.limit(pageSize).offset((page - 1) * pageSize);
    const response = { data };
    searchCache.set(cacheKey, { timestamp: now, response });
    return Response.json(response);
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

