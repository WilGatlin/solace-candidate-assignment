-- Enable pg_trgm extension (safe if run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add a plain text column for specialties (space-joined)
ALTER TABLE advocates ADD COLUMN IF NOT EXISTS specialties_text text;

-- Trigger to keep specialties_text in sync with specialties
CREATE OR REPLACE FUNCTION update_specialties_text() RETURNS trigger AS $$
BEGIN
  NEW.specialties_text := array_to_string(ARRAY(SELECT jsonb_array_elements_text(NEW.specialties)), ' ');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_specialties_text ON advocates;
CREATE TRIGGER trg_update_specialties_text
  BEFORE INSERT OR UPDATE OF specialties ON advocates
  FOR EACH ROW EXECUTE FUNCTION update_specialties_text();

-- Add a generated tsvector column for full-text search (uses specialties_text)
ALTER TABLE advocates
ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(degree, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(specialties_text, '')), 'D')
) STORED;

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_advocates_search_vector ON advocates USING GIN (search_vector);

-- GIN trigram indexes for fuzzy/substring search
CREATE INDEX IF NOT EXISTS idx_advocates_firstname_trgm ON advocates USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_advocates_lastname_trgm ON advocates USING gin (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_advocates_city_trgm ON advocates USING gin (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_advocates_degree_trgm ON advocates USING gin (degree gin_trgm_ops);
-- For specialties, use a trgm index on the specialties_text column
CREATE INDEX IF NOT EXISTS idx_advocates_specialties_trgm ON advocates USING gin (specialties_text gin_trgm_ops);
