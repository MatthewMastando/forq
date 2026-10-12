-- Recipes shared from the Forq mobile app via public links (/r/:id).
-- Rows are written only by the server (api/share.ts, using the service role key) and are readable by anyone with the link.

CREATE TABLE IF NOT EXISTS shared_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shared_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared recipes" ON shared_recipes
  FOR SELECT USING (true);
