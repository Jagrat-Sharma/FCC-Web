-- Existing products keep their visibility, images and descriptions.
ALTER TABLE products ADD COLUMN brand TEXT NOT NULL DEFAULT '' CHECK(length(brand) <= 120);
ALTER TABLE products ADD COLUMN specifications TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(specifications));
CREATE INDEX products_brand_public ON products(published, brand COLLATE NOCASE);
