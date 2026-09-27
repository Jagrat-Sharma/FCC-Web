-- Reviewed catalogue batch, 2026-09-27. All products start as drafts.
-- Sources, missing images and review notes: catalogue-imports/2026-09-27.json.
-- Re-running does not overwrite products, publish drafts or change existing edits.
INSERT INTO categories (id, name, slug, sort_order) VALUES ('rugs', 'Area Rugs', 'rugs', 15) ON CONFLICT(id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('linoleum', 'Linoleum', 'linoleum', 65) ON CONFLICT(id) DO NOTHING;
INSERT INTO categories (id, name, slug, sort_order) VALUES ('commercial-matting', 'Commercial Matting', 'commercial-matting', 75) ON CONFLICT(id) DO NOTHING;

-- Aladdin Commercial: Daily Wire — 2B194
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '028bd4fa-f71d-47c2-bba3-b0e6f7b949b2',
       '[{"source_image_url":"","name":"Viral Reality","code":"828","image_id":null},{"source_image_url":"","name":"Trending Now","code":"559","image_id":null},{"source_image_url":"","name":"Get Wired","code":"888","image_id":null},{"source_image_url":"","name":"Insider Feed","code":"949","image_id":null},{"source_image_url":"","name":"Instant Impact","code":"978","image_id":null},{"source_image_url":"","name":"Breaking Update","code":"989","image_id":null}]',
       'Aladdin Commercial',
       '{"material":"EnviroStrand PET","size":"24 × 24 in","backing":"Ultraset Matrix","construction":"Tufted patterned loop"}',
       'Daily Wire — 2B194 by Aladdin Commercial. Modular carpet flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Daily Wire — 2B194',
       'carpet-tiles',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Aladdin Commercial') AND lower(name) = lower('Daily Wire — 2B194'))
ON CONFLICT(id) DO NOTHING;

-- Shaw Floors: Classic Tone — 5E915
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '1351ba43-d002-44f4-bd84-4af2bdf1d55f',
       '[{"source_image_url":"https://shawfloors.widen.net/content/tupb1k0ltj/jpeg/5e915_00500_main?w=840&h=0&fmt=jpeg&quality=85&keep=c&crop=true","name":"Minimalist","code":"00500","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/pz5yiqfyrk/jpeg/5e915_00100_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Sweet Cream","code":"00100","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/y4tbepwghs/jpeg/5e915_00102_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Summertime","code":"00102","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/ilnnetwedh/jpeg/5e915_00103_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Open Canyon","code":"00103","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/edas3wpcls/jpeg/5e915_00104_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Pebble Path","code":"00104","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/0vidbuyiqf/jpeg/5e915_00105_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Soft Sand","code":"00105","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/v2leakghhm/jpeg/5e915_00106_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Baja","code":"00106","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/lpyxa0lpgk/jpeg/5e915_00107_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Cool Winter","code":"00107","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/bqixvdnahi/jpeg/5e915_00108_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Chateau","code":"00108","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/v7fjvmquql/jpeg/5e915_00109_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Twilight Taupe","code":"00109","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/nsukk1azik/jpeg/5e915_00110_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Safari","code":"00110","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/3q7mgh8bxn/jpeg/5e915_00150_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Alpine Snow","code":"00150","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/140hfym69q/jpeg/5e915_00300_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Olive Tree","code":"00300","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/dcyocz0wzd/jpeg/5e915_00301_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Refreshing","code":"00301","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/hya19jejgh/jpeg/5e915_00302_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Evergreen","code":"00302","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/2q8imsq0y5/jpeg/5e915_00320_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Frosted Sage","code":"00320","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/9rn6nkaiuo/jpeg/5e915_00400_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Sky Blue","code":"00400","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/4j3cjtujmi/jpeg/5e915_00401_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Washed Denim","code":"00401","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/qsreyezxcw/jpeg/5e915_00402_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Deep Indigo","code":"00402","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/kmmfrroytg/jpeg/5e915_00403_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Oceanic","code":"00403","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/iilxxij4ew/jpeg/5e915_00422_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"South Pacific","code":"00422","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/r227pgo6hf/jpeg/5e915_00450_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Icy Mist","code":"00450","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/l9x5zwiocc/jpeg/5e915_00501_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Distant Star","code":"00501","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/23og0coqzu/jpeg/5e915_00502_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Magnetic","code":"00502","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/cxoputhkis/jpeg/5e915_00503_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Gateway Grey","code":"00503","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/u4fvh85bzj/jpeg/5e915_00504_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Mysterious","code":"00504","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/ly0w7zdmgw/jpeg/5e915_00700_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Latte","code":"00700","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/i9kstorhix/jpeg/5e915_00701_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Ridgeline","code":"00701","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/7iptnqrhnq/jpeg/5e915_00702_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Driftwood","code":"00702","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/cm3ftpn7ke/jpeg/5e915_00703_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Mirage","code":"00703","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/gptycpf16g/jpeg/5e915_00704_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Natural Stone","code":"00704","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/i9sv0902cy/jpeg/5e915_00706_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"After Dark","code":"00706","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/sbkaodanxr/jpeg/5e915_00750_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Night Owl","code":"00750","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/nko5rgmehf/jpeg/5e915_00800_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Blissful Blush","code":"00800","image_id":null},{"source_image_url":"https://shawfloors.widen.net/content/orfkcppzvw/jpeg/5e915_00801_main?w=120&h=120&fmt=jpeg&quality=85&keep=c&crop=true","name":"Warm Sunset","code":"00801","image_id":null}]',
       'Shaw Floors',
       '{"material":"100% ANSO High Performance Solution Dyed PET","width":"12 ft","construction":"Cut pile","backing":"SoftBac"}',
       'Classic Tone — 5E915 by Shaw Floors. Broadloom carpet. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Classic Tone — 5E915',
       'carpet',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Shaw Floors') AND lower(name) = lower('Classic Tone — 5E915'))
ON CONFLICT(id) DO NOTHING;

-- Shaw Contract: Dye Lab Tile — 5T041
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '7787c27d-9565-40d6-9799-29388f25499c',
       '[{"source_image_url":"","name":"Osage Orange","code":"41202","image_id":null},{"source_image_url":"","name":"Fustic Wood","code":"41316","image_id":null},{"source_image_url":"","name":"Mint","code":"41395","image_id":null},{"source_image_url":"","name":"Fustic Saxon","code":"41396","image_id":null},{"source_image_url":"","name":"Black Walnut","code":"41402","image_id":null},{"source_image_url":"","name":"Saxon","code":"41462","image_id":null},{"source_image_url":"","name":"Cornflower","code":"41480","image_id":null},{"source_image_url":"","name":"Knotweed","code":"41491","image_id":null},{"source_image_url":"","name":"Indigo","code":"41496","image_id":null},{"source_image_url":"","name":"Woad","code":"41497","image_id":null},{"source_image_url":"","name":"Sumac","code":"41504","image_id":null},{"source_image_url":"","name":"Logwood","code":"41505","image_id":null},{"source_image_url":"","name":"Black Tea","code":"41516","image_id":null},{"source_image_url":"","name":"Henna","code":"41535","image_id":null},{"source_image_url":"","name":"Iron","code":"41580","image_id":null},{"source_image_url":"","name":"Sandalwood","code":"41665","image_id":null},{"source_image_url":"","name":"Lac","code":"41762","image_id":null},{"source_image_url":"","name":"Brazil Wood","code":"41855","image_id":null},{"source_image_url":"","name":"Madder Root","code":"41864","image_id":null},{"source_image_url":"","name":"Rust","code":"41865","image_id":null},{"source_image_url":"","name":"Cochineal","code":"41880","image_id":null},{"source_image_url":"","name":"Beet","code":"41890","image_id":null},{"source_image_url":"","name":"Elderberry","code":"41905","image_id":null},{"source_image_url":"","name":"Iris","code":"41965","image_id":null}]',
       'Shaw Contract',
       '{"size":"24 × 24 in (61 × 61 cm)","construction":"Cut pile"}',
       'Dye Lab Tile — 5T041 by Shaw Contract. Modular carpet flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Dye Lab Tile — 5T041',
       'carpet-tiles',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Shaw Contract') AND lower(name) = lower('Dye Lab Tile — 5T041'))
ON CONFLICT(id) DO NOTHING;

-- Philadelphia Commercial: Profusion 26 — 54969
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '5e0e251a-a126-4de8-9c74-068ce26dff38',
       '[{"source_image_url":"","name":"Masses","code":"00200","image_id":null},{"source_image_url":"","name":"Bundle","code":"00215","image_id":null},{"source_image_url":"","name":"Ample","code":"00230","image_id":null},{"source_image_url":"","name":"Stacks","code":"00300","image_id":null},{"source_image_url":"","name":"Multitude","code":"00400","image_id":null},{"source_image_url":"","name":"Array","code":"00410","image_id":null},{"source_image_url":"","name":"Volume","code":"00415","image_id":null},{"source_image_url":"","name":"Plenitude","code":"00500","image_id":null},{"source_image_url":"","name":"Tons","code":"00505","image_id":null},{"source_image_url":"","name":"Oodles","code":"00510","image_id":null},{"source_image_url":"","name":"Cluster","code":"00515","image_id":null},{"source_image_url":"","name":"Plethora","code":"00520","image_id":null},{"source_image_url":"","name":"Surplus","code":"00600","image_id":null},{"source_image_url":"","name":"Heaps","code":"00700","image_id":null},{"source_image_url":"","name":"Piles","code":"00702","image_id":null},{"source_image_url":"","name":"Scads","code":"00715","image_id":null},{"source_image_url":"","name":"Bounty","code":"00720","image_id":null},{"source_image_url":"","name":"Abundance","code":"00725","image_id":null},{"source_image_url":"","name":"Excess","code":"00730","image_id":null},{"source_image_url":"","name":"Overflow","code":"00735","image_id":null},{"source_image_url":"","name":"Gobs","code":"00800","image_id":null},{"source_image_url":"","name":"Thrive","code":"00830","image_id":null}]',
       'Philadelphia Commercial',
       '{}',
       'Profusion 26 — 54969 by Philadelphia Commercial. Broadloom carpet. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Profusion 26 — 54969',
       'carpet',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Philadelphia Commercial') AND lower(name) = lower('Profusion 26 — 54969'))
ON CONFLICT(id) DO NOTHING;

-- Patcraft: Traced — I0731
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '1915e4de-8de6-4488-9d30-bc066cd3902e',
       '[{"source_image_url":"","name":"Tapestry","code":"","image_id":null},{"source_image_url":"","name":"Medallion","code":"","image_id":null},{"source_image_url":"","name":"Birch","code":"","image_id":null},{"source_image_url":"","name":"Lace","code":"","image_id":null},{"source_image_url":"","name":"Artemis","code":"","image_id":null},{"source_image_url":"","name":"Shearling","code":"","image_id":null},{"source_image_url":"","name":"Suede","code":"","image_id":null},{"source_image_url":"","name":"Armor","code":"","image_id":null},{"source_image_url":"","name":"Charcoal","code":"","image_id":null},{"source_image_url":"","name":"Mahogany","code":"","image_id":null}]',
       'Patcraft',
       '{}',
       'Traced — I0731 by Patcraft. Modular carpet flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Traced — I0731',
       'carpet-tiles',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Patcraft') AND lower(name) = lower('Traced — I0731'))
ON CONFLICT(id) DO NOTHING;

-- Stanton Carpet: Jazzy
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '7ed010cf-bab9-4d8a-b29b-7a434fc01a51',
       '[{"source_image_url":"","name":"Sky","code":"89753","image_id":null},{"source_image_url":"","name":"Bisque","code":"","image_id":null},{"source_image_url":"","name":"Champagne","code":"","image_id":null},{"source_image_url":"","name":"Charcoal","code":"","image_id":null},{"source_image_url":"","name":"Chrome","code":"","image_id":null},{"source_image_url":"","name":"Cloud","code":"","image_id":null},{"source_image_url":"","name":"Dune","code":"","image_id":null},{"source_image_url":"","name":"Eggshell","code":"","image_id":null},{"source_image_url":"","name":"Pewter","code":"","image_id":null},{"source_image_url":"","name":"Platinum","code":"","image_id":null},{"source_image_url":"","name":"Sapphire","code":"","image_id":null},{"source_image_url":"","name":"Smoke","code":"","image_id":null},{"source_image_url":"","name":"Snow","code":"","image_id":null}]',
       'Stanton Carpet',
       '{"material":"100% nylon","construction":"Machine tufted","width":"13 ft 2 in"}',
       'Jazzy by Stanton Carpet. Broadloom carpet. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Jazzy',
       'carpet',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Stanton Carpet') AND lower(name) = lower('Jazzy'))
ON CONFLICT(id) DO NOTHING;

-- Anderson Tuftex: Always Natural — ZZ289
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'be54ba48-4716-401b-9391-61cb496dd271',
       '[{"source_image_url":"","name":"Inlet","code":"00437","image_id":null},{"source_image_url":"","name":"Shady","code":"00536","image_id":null},{"source_image_url":"","name":"Muslin","code":"00172","image_id":null},{"source_image_url":"","name":"Twine","code":"00173","image_id":null},{"source_image_url":"","name":"Basket","code":"00174","image_id":null},{"source_image_url":"","name":"Boutique","code":"00224","image_id":null},{"source_image_url":"","name":"Cork","code":"00273","image_id":null},{"source_image_url":"","name":"Sailcloth","code":"00275","image_id":null},{"source_image_url":"","name":"Graceful","code":"00345","image_id":null},{"source_image_url":"","name":"Blue Fern","code":"00348","image_id":null},{"source_image_url":"","name":"Blustery","code":"00352","image_id":null},{"source_image_url":"","name":"Sky Glass","code":"00435","image_id":null},{"source_image_url":"","name":"Harbor","code":"00448","image_id":null},{"source_image_url":"","name":"Foggy","code":"00542","image_id":null},{"source_image_url":"","name":"Silver Polish","code":"00546","image_id":null},{"source_image_url":"","name":"Fossil","code":"00753","image_id":null},{"source_image_url":"","name":"Barrel","code":"00755","image_id":null},{"source_image_url":"","name":"Tuscan","code":"00775","image_id":null}]',
       'Anderson Tuftex',
       '{"material":"100% ANSO High Performance Nylon","width":"12 ft"}',
       'Always Natural — ZZ289 by Anderson Tuftex. Carpet for custom rugs. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Always Natural — ZZ289',
       'rugs',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Anderson Tuftex') AND lower(name) = lower('Always Natural — ZZ289'))
ON CONFLICT(id) DO NOTHING;

-- Pentz Commercial: Echo Tile — 7055T
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '4172e452-06ba-4374-84b2-0a8d80dbfe03',
       '[{"source_image_url":"","name":"Indigo","code":"3135","image_id":null},{"source_image_url":"","name":"Royal Purple","code":"3136","image_id":null},{"source_image_url":"","name":"Midnight","code":"3137","image_id":null},{"source_image_url":"","name":"Chili Red","code":"3138","image_id":null},{"source_image_url":"","name":"Crimson","code":"3139","image_id":null},{"source_image_url":"","name":"Carob","code":"3140","image_id":null},{"source_image_url":"","name":"Matte Lake","code":"3141","image_id":null},{"source_image_url":"","name":"Sunburst","code":"3142","image_id":null},{"source_image_url":"","name":"Medallion","code":"3143","image_id":null},{"source_image_url":"","name":"Cyber","code":"3144","image_id":null},{"source_image_url":"","name":"Ocean Tropic","code":"3145","image_id":null},{"source_image_url":"","name":"Cloud","code":"3146","image_id":null},{"source_image_url":"","name":"Parrot","code":"3147","image_id":null},{"source_image_url":"","name":"Skyrocket","code":"3171","image_id":null}]',
       'Pentz Commercial',
       '{"material":"APEX SDP polyester, solution dyed","construction":"Patterned loop","backing":"Nexus Modular","size":"24 × 24 in (60.96 × 60.96 cm)"}',
       'Echo Tile — 7055T by Pentz Commercial. Modular carpet flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Echo Tile — 7055T',
       'carpet-tiles',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Pentz Commercial') AND lower(name) = lower('Echo Tile — 7055T'))
ON CONFLICT(id) DO NOTHING;

-- Godfrey Hirst: Inspirational
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'c50e6864-a45f-4a82-8595-0476dd03ab70',
       '[{"source_image_url":"","name":"Cloudy Day","code":"725","image_id":null},{"source_image_url":"","name":"Deep Purple","code":"280","image_id":null},{"source_image_url":"","name":"Cameo","code":"420","image_id":null},{"source_image_url":"","name":"Dover White","code":"500","image_id":null},{"source_image_url":"","name":"Birchwood","code":"525","image_id":null},{"source_image_url":"","name":"Acorn","code":"550","image_id":null},{"source_image_url":"","name":"Super Nova","code":"670","image_id":null},{"source_image_url":"","name":"Cygnet","code":"705","image_id":null},{"source_image_url":"","name":"Dove","code":"710","image_id":null},{"source_image_url":"","name":"Glacier","code":"715","image_id":null},{"source_image_url":"","name":"Limestone","code":"716","image_id":null},{"source_image_url":"","name":"Silver Berry","code":"730","image_id":null},{"source_image_url":"","name":"Argent","code":"735","image_id":null},{"source_image_url":"","name":"Sharkskin","code":"740","image_id":null},{"source_image_url":"","name":"Dolphin","code":"745","image_id":null},{"source_image_url":"","name":"Greystone","code":"750","image_id":null},{"source_image_url":"","name":"Driftwood","code":"763","image_id":null},{"source_image_url":"","name":"Arctic Grey","code":"765","image_id":null},{"source_image_url":"","name":"Manatee","code":"770","image_id":null},{"source_image_url":"","name":"Dark Grey","code":"774","image_id":null},{"source_image_url":"","name":"Mica","code":"775","image_id":null},{"source_image_url":"","name":"Dark Shadow","code":"780","image_id":null},{"source_image_url":"","name":"Fresh Breeze","code":"814","image_id":null},{"source_image_url":"","name":"Ice Blue","code":"815","image_id":null},{"source_image_url":"","name":"Smokey Blue","code":"822","image_id":null},{"source_image_url":"","name":"Deep Sky","code":"825","image_id":null},{"source_image_url":"","name":"Blue Shadow","code":"860","image_id":null},{"source_image_url":"","name":"Mountain Blue","code":"890","image_id":null},{"source_image_url":"","name":"Ice Green","code":"920","image_id":null},{"source_image_url":"","name":"Greendale","code":"930","image_id":null}]',
       'Godfrey Hirst',
       '{"material":"Triexta","construction":"Cut pile twist","width":"3.66 m","thickness":"15.5 mm (±1 mm)","pile":"13 mm (±1 mm)"}',
       'Inspirational by Godfrey Hirst. Broadloom carpet. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Inspirational',
       'carpet',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Godfrey Hirst') AND lower(name) = lower('Inspirational'))
ON CONFLICT(id) DO NOTHING;

-- Goodfellow: Hydrasafe 12 mm
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '0160e472-f383-4199-9e80-dad652fbd610',
       '[{"source_image_url":"","name":"Baffin","code":"8150","image_id":null},{"source_image_url":"","name":"Baltic","code":"8151","image_id":null},{"source_image_url":"","name":"Beaufort","code":"8152","image_id":null},{"source_image_url":"","name":"Celtic","code":"8153","image_id":null},{"source_image_url":"","name":"Melville","code":"8154","image_id":null},{"source_image_url":"","name":"McKinley","code":"8155","image_id":null},{"source_image_url":"","name":"Caledonia","code":"8156","image_id":null},{"source_image_url":"","name":"Sundown","code":"8157","image_id":null},{"source_image_url":"","name":"Seawood","code":"8158","image_id":null}]',
       'Goodfellow',
       '{"thickness":"12 mm","rating":"AC4","finish":"Embossed in register (EIR)","installation":"Floating; 5G Drop Lock"}',
       'Hydrasafe 12 mm by Goodfellow. Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Hydrasafe 12 mm',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Goodfellow') AND lower(name) = lower('Hydrasafe 12 mm'))
ON CONFLICT(id) DO NOTHING;

-- Torlys Flooring: Olympic 5
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '600e0c99-6706-4f13-95ef-0fe99c863a84',
       '[{"source_image_url":"https://torlys.com/wp-content/uploads/2025/09/Olympic-5-MQLL-550-150x150.jpg","name":"Paris Oak","code":"MQLL-550","image_id":null},{"source_image_url":"","name":"Whistler Oak","code":"MQLL-551","image_id":null},{"source_image_url":"","name":"Turin Oak","code":"MQLL-552","image_id":null},{"source_image_url":"","name":"London Oak","code":"MQLL-555","image_id":null},{"source_image_url":"","name":"Tokyo Oak","code":"MQLL-553","image_id":null},{"source_image_url":"","name":"Athens Oak","code":"MQLL-556","image_id":null},{"source_image_url":"","name":"Rio Walnut","code":"MQLL-557","image_id":null},{"source_image_url":"","name":"Sydney Oak","code":"MQLL-554","image_id":null}]',
       'Torlys Flooring',
       '{"thickness":"5 mm","width":"7 in","length":"48 in","installation":"Loose lay"}',
       'Olympic 5 by Torlys Flooring. Luxury vinyl flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Olympic 5',
       'vinyl',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Torlys Flooring') AND lower(name) = lower('Olympic 5'))
ON CONFLICT(id) DO NOTHING;

-- Biyork Floors: HydroGen 5
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '9a256c99-ab03-4886-bb90-8bf87ab550ff',
       '[{"source_image_url":"","name":"Cashmere","code":"","image_id":null},{"source_image_url":"","name":"Gold Coast","code":"","image_id":null},{"source_image_url":"","name":"Everest","code":"","image_id":null},{"source_image_url":"","name":"Morning Splendour","code":"","image_id":null},{"source_image_url":"","name":"Liberty","code":"","image_id":null},{"source_image_url":"","name":"Overcast","code":"","image_id":null},{"source_image_url":"","name":"Nickel","code":"","image_id":null},{"source_image_url":"","name":"Silk Palace","code":"","image_id":null}]',
       'Biyork Floors',
       '{"construction":"SPC","width":"7 in","length":"48 in","thickness":"5 mm overall","wear_layer":"0.3 mm","backing":"UnderTone pad","installation":"Click system"}',
       'HydroGen 5 by Biyork Floors. Luxury vinyl flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'HydroGen 5',
       'vinyl',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Biyork Floors') AND lower(name) = lower('HydroGen 5'))
ON CONFLICT(id) DO NOTHING;

-- MSI Surfaces: Cyrus
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'ea1f5317-6648-416d-b8c0-690a316c4bda',
       '[{"source_image_url":"","name":"Akadia","code":"","image_id":null},{"source_image_url":"","name":"Amber Forrester","code":"","image_id":null},{"source_image_url":"","name":"Austell Grove","code":"","image_id":null},{"source_image_url":"","name":"Barnstorm","code":"","image_id":null},{"source_image_url":"","name":"Barrell","code":"","image_id":null},{"source_image_url":"","name":"Bembridge","code":"","image_id":null},{"source_image_url":"","name":"Billingham","code":"","image_id":null},{"source_image_url":"","name":"Boswell","code":"","image_id":null},{"source_image_url":"","name":"Bracken Hill","code":"","image_id":null},{"source_image_url":"","name":"Braly","code":"","image_id":null},{"source_image_url":"","name":"Brianka","code":"","image_id":null},{"source_image_url":"","name":"Brookings","code":"","image_id":null},{"source_image_url":"","name":"Brookline","code":"","image_id":null},{"source_image_url":"","name":"Chester Hills","code":"","image_id":null},{"source_image_url":"","name":"Cranton","code":"","image_id":null},{"source_image_url":"","name":"Draven","code":"","image_id":null},{"source_image_url":"","name":"Dulles Tails","code":"","image_id":null},{"source_image_url":"","name":"Dunite Oak","code":"","image_id":null},{"source_image_url":"","name":"Exotika","code":"","image_id":null},{"source_image_url":"","name":"Fauna","code":"","image_id":null},{"source_image_url":"","name":"Finely","code":"","image_id":null},{"source_image_url":"","name":"Grayton","code":"","image_id":null},{"source_image_url":"","name":"Hawthorne","code":"","image_id":null},{"source_image_url":"","name":"HoneyBella Oak","code":"","image_id":null},{"source_image_url":"","name":"Jenta","code":"","image_id":null},{"source_image_url":"","name":"Kardigan","code":"","image_id":null},{"source_image_url":"","name":"Katella Ash","code":"","image_id":null},{"source_image_url":"","name":"Lenexa Creek","code":"","image_id":null},{"source_image_url":"","name":"Ludlow","code":"","image_id":null},{"source_image_url":"","name":"Mezcla","code":"","image_id":null},{"source_image_url":"","name":"Runmill Isle","code":"","image_id":null},{"source_image_url":"","name":"Ryder","code":"","image_id":null},{"source_image_url":"","name":"Sandino","code":"","image_id":null},{"source_image_url":"","name":"Stable","code":"","image_id":null},{"source_image_url":"","name":"Valleyview Grove","code":"","image_id":null},{"source_image_url":"","name":"Walnut Waves","code":"","image_id":null},{"source_image_url":"","name":"Weathered Brina","code":"","image_id":null},{"source_image_url":"","name":"Whitfield Gray","code":"","image_id":null},{"source_image_url":"","name":"Woburn Abbey","code":"","image_id":null},{"source_image_url":"","name":"Wolfeboro","code":"","image_id":null}]',
       'MSI Surfaces',
       '{"width":"7 in","length":"48 in","thickness":"5 mm total","wear_layer":"12 mil","backing":"Attached pad","installation":"Floating click"}',
       'Cyrus by MSI Surfaces. Luxury vinyl flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Cyrus',
       'vinyl',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('MSI Surfaces') AND lower(name) = lower('Cyrus'))
ON CONFLICT(id) DO NOTHING;

-- Interface: Open Air 417 — 9690C
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '6875e438-3b2d-4fe6-a93c-eef5b80f74e8',
       '[{"source_image_url":"","name":"Amber","code":"107794","image_id":null},{"source_image_url":"","name":"Barley","code":"108950","image_id":null},{"source_image_url":"","name":"Black","code":"107030","image_id":null},{"source_image_url":"","name":"Brown","code":"107792","image_id":null},{"source_image_url":"","name":"Buckwheat","code":"108944","image_id":null},{"source_image_url":"","name":"Burlap","code":"108943","image_id":null},{"source_image_url":"","name":"Charcoal","code":"107033","image_id":null},{"source_image_url":"","name":"Concrete","code":"108948","image_id":null},{"source_image_url":"","name":"Ebony","code":"107790","image_id":null},{"source_image_url":"","name":"Flannel","code":"107032","image_id":null},{"source_image_url":"","name":"Granite","code":"107036","image_id":null},{"source_image_url":"","name":"Gypsum","code":"108947","image_id":null},{"source_image_url":"","name":"Iron","code":"107031","image_id":null},{"source_image_url":"","name":"Linen","code":"107038","image_id":null},{"source_image_url":"","name":"Mist","code":"107788","image_id":null},{"source_image_url":"","name":"Natural","code":"107034","image_id":null},{"source_image_url":"","name":"Navy","code":"107789","image_id":null},{"source_image_url":"","name":"Nickel","code":"107035","image_id":null},{"source_image_url":"","name":"Oat","code":"107791","image_id":null},{"source_image_url":"","name":"Raffia","code":"108945","image_id":null},{"source_image_url":"","name":"Sawgrass","code":"108946","image_id":null},{"source_image_url":"","name":"Shell","code":"107793","image_id":null},{"source_image_url":"","name":"Stone","code":"107037","image_id":null},{"source_image_url":"","name":"Travertine","code":"108949","image_id":null}]',
       'Interface',
       '{}',
       'Open Air 417 — 9690C by Interface. Modular carpet flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Open Air 417 — 9690C',
       'carpet-tiles',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Interface') AND lower(name) = lower('Open Air 417 — 9690C'))
ON CONFLICT(id) DO NOTHING;

-- ViFloor: Super Series
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'd349d1e4-0c12-48c3-bc87-4e294fbf53cd',
       '[{"source_image_url":"","name":"Colour 1120","code":"1120","image_id":null},{"source_image_url":"","name":"Colour 1174","code":"1174","image_id":null},{"source_image_url":"","name":"Colour 1127","code":"1127","image_id":null},{"source_image_url":"","name":"Colour 1143","code":"1143","image_id":null},{"source_image_url":"","name":"Colour 1148","code":"1148","image_id":null},{"source_image_url":"","name":"Colour 1140","code":"1140","image_id":null},{"source_image_url":"","name":"Colour 1172","code":"1172","image_id":null},{"source_image_url":"","name":"Colour 1118","code":"1118","image_id":null},{"source_image_url":"","name":"Colour 1152","code":"1152","image_id":null},{"source_image_url":"","name":"Colour 1110","code":"1110","image_id":null},{"source_image_url":"","name":"Colour 1115","code":"1115","image_id":null},{"source_image_url":"","name":"Colour 1129","code":"1129","image_id":null},{"source_image_url":"","name":"Colour 1105","code":"1105","image_id":null},{"source_image_url":"","name":"Colour 1106","code":"1106","image_id":null},{"source_image_url":"","name":"Colour 1111","code":"1111","image_id":null},{"source_image_url":"","name":"Colour 1175","code":"1175","image_id":null},{"source_image_url":"","name":"Colour 1150","code":"1150","image_id":null},{"source_image_url":"","name":"Colour 1130","code":"1130","image_id":null},{"source_image_url":"","name":"Colour 1133","code":"1133","image_id":null},{"source_image_url":"","name":"Colour 1123","code":"1123","image_id":null},{"source_image_url":"","name":"Colour 1100","code":"1100","image_id":null},{"source_image_url":"","name":"Colour 1134","code":"1134","image_id":null},{"source_image_url":"","name":"Colour 1137","code":"1137","image_id":null},{"source_image_url":"","name":"Colour 1153","code":"1153","image_id":null}]',
       'ViFloor',
       '{"material":"100% ASOTA solution-dyed polypropylene","construction":"Needle punched","backing":"Eco-DI-back natural-synthetic composite rubber","width":"200 cm","length":"23 m roll","thickness":"12.5 mm"}',
       'Super Series by ViFloor. Commercial entrance matting. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Super Series',
       'commercial-matting',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('ViFloor') AND lower(name) = lower('Super Series'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): AquaSure Pro
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '1576ecc8-2e4c-4fba-b298-ffb080721bd3',
       '[{"source_image_url":"","name":"Coastal","code":"RLAAQSPCOAS","image_id":null},{"source_image_url":"","name":"Malibu","code":"RLAAQSPMALI","image_id":null},{"source_image_url":"","name":"Lauderdale","code":"RLAAQSPLAUD","image_id":null},{"source_image_url":"","name":"Eastlake","code":"RLAAQSPEAST","image_id":null},{"source_image_url":"","name":"Daytona","code":"RLAAQSPDAYT","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"width":"193 mm","length":"1383 mm","rating":"AC5","installation":"Floating; angle/tap"}',
       'AquaSure Pro by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'AquaSure Pro',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('AquaSure Pro'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): Accord Select
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'c9098ae5-6e32-4a64-b9da-a3cb71c410d7',
       '[{"source_image_url":"","name":"Gulf Island","code":"RLAACCSGULF","image_id":null},{"source_image_url":"","name":"Kazan","code":"RLAACCSKAZA","image_id":null},{"source_image_url":"","name":"Lodge","code":"RLAACCSLODG","image_id":null},{"source_image_url":"","name":"Beach House","code":"RLAACCSBEAC","image_id":null},{"source_image_url":"","name":"Short Hills","code":"RLAACCSSHOR","image_id":null},{"source_image_url":"","name":"Biscuit","code":"RLAACCSBUIS","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"thickness":"8 mm","width":"197 mm","length":"1220 mm","coverage":"20.7 sq. ft.","rating":"AC4","installation":"Floating; Uniclic angle/tap"}',
       'Accord Select by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Accord Select',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('Accord Select'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): Solidarity
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '8668cf2e-532b-49b1-a409-3daa1ed4b99e',
       '[{"source_image_url":"","name":"Lodge","code":"RLASOLILODG","image_id":null},{"source_image_url":"","name":"Stampede","code":"RLASOLISTAM","image_id":null},{"source_image_url":"","name":"Kazan","code":"RLASOLIKAZA","image_id":null},{"source_image_url":"","name":"Pale Moon","code":"RLASOLIPALE","image_id":null},{"source_image_url":"","name":"Short Hills","code":"RLASOLISHOR","image_id":null},{"source_image_url":"","name":"Aura","code":"RLASOLIAURA","image_id":null},{"source_image_url":"","name":"Beach House","code":"RLASOLIBEAC","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"thickness":"8 mm","width":"197 mm","length":"1220 mm","coverage":"20.7 sq. ft.","rating":"AC4","installation":"Floating; Uniclic angle/tap"}',
       'Solidarity by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Solidarity',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('Solidarity'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): Accord Premium
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '33fbfe94-57a9-45cb-b693-87652eebe39b',
       '[{"source_image_url":"","name":"Muldrew","code":"RLAACCPMULD","image_id":null},{"source_image_url":"","name":"Lancaster","code":"RLAACCPLANC","image_id":null},{"source_image_url":"","name":"Stampede","code":"RLAACCPSTAM","image_id":null},{"source_image_url":"","name":"Aura","code":"RLAACCPAURA","image_id":null},{"source_image_url":"","name":"Biscuit","code":"RLAACCPBISC","image_id":null},{"source_image_url":"","name":"Solstice","code":"RLAACCPSOLS","image_id":null},{"source_image_url":"","name":"Summer Harvest","code":"RLAACCPSUMM","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"thickness":"12 mm","width":"197 mm","length":"1220 mm","coverage":"15.44 sq. ft.","rating":"AC4","installation":"Floating; drop lock"}',
       'Accord Premium by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Accord Premium',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('Accord Premium'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): AquaSure Premium
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'd35262bc-886b-4039-b711-9291e1770244',
       '[{"source_image_url":"","name":"Toast","code":"RLAAQPRTOAS","image_id":null},{"source_image_url":"","name":"Cordoba","code":"RLAAQPRCORD","image_id":null},{"source_image_url":"","name":"Windsor Tan","code":"RLAAQPRWIND","image_id":null},{"source_image_url":"","name":"Coastal","code":"RLAAQPRCOAS","image_id":null},{"source_image_url":"","name":"Dusty Mountain","code":"RLAAQPRDUST","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"thickness":"12 mm","width":"193 mm","length":"1383 mm","coverage":"17.24 sq. ft.","rating":"AC4","installation":"Floating; angle/tap"}',
       'AquaSure Premium by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'AquaSure Premium',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('AquaSure Premium'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): AquaSure Chic
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '4611d6e0-2586-4d3d-abc2-5459cd0f2fc8',
       '[{"source_image_url":"","name":"Linen","code":"RLAAQCHLINE","image_id":null},{"source_image_url":"","name":"Barbuda","code":"RLAAQCHBARB","image_id":null},{"source_image_url":"","name":"Light Oak","code":"RLAAQCHLIGH","image_id":null},{"source_image_url":"","name":"Eastlake","code":"RLAAQCHEAST","image_id":null},{"source_image_url":"","name":"Carlton","code":"RLAAQCHCARL","image_id":null},{"source_image_url":"","name":"Butternut","code":"RLAAQCHBUTT","image_id":null},{"source_image_url":"","name":"Athena","code":"RLAAQCHATHE","image_id":null},{"source_image_url":"","name":"Guildwood","code":"RLAAQCHGUIL","image_id":null},{"source_image_url":"","name":"Mistywood","code":"RLAAQCHMIST","image_id":null},{"source_image_url":"","name":"Bushwick","code":"RLAAQCHBUSH","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"thickness":"8 mm","width":"193 mm","length":"1383 mm","coverage":"25.86 sq. ft.","rating":"AC4","installation":"Floating; angle/tap"}',
       'AquaSure Chic by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'AquaSure Chic',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('AquaSure Chic'))
ON CONFLICT(id) DO NOTHING;

-- Richmond Flooring (Shnier/Gesco): Dovedale
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '95945585-34f5-4734-96cc-10baf9830153',
       '[{"source_image_url":"","name":"Erie","code":"RLADOVEERIE","image_id":null},{"source_image_url":"","name":"Hickory Canyon","code":"RLADOVEHICA","image_id":null},{"source_image_url":"","name":"Tartufo","code":"RLADOVETART","image_id":null},{"source_image_url":"","name":"Huron","code":"RLADOVEHURO","image_id":null},{"source_image_url":"","name":"Hickory Desert","code":"RLADOVEHIDE","image_id":null},{"source_image_url":"","name":"Maple Dayton","code":"RLAK4368AV","image_id":null},{"source_image_url":"","name":"Wilderness","code":"RLAK2241EG","image_id":null},{"source_image_url":"","name":"Cordoba","code":"RLAK2239EG","image_id":null},{"source_image_url":"","name":"Ashford","code":"RLA37293AV","image_id":null},{"source_image_url":"","name":"Athena","code":"RLAK4442EG","image_id":null}]',
       'Richmond Flooring (Shnier/Gesco)',
       '{"thickness":"12 mm","width":"193 mm","length":"1383 mm","coverage":"17.24 sq. ft.","rating":"AC3","installation":"Drop lock"}',
       'Dovedale by Richmond Flooring (Shnier/Gesco). Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Dovedale',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Richmond Flooring (Shnier/Gesco)') AND lower(name) = lower('Dovedale'))
ON CONFLICT(id) DO NOTHING;

-- Mohawk Industries: Rare Vintage — CDL74
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '9b8cf1e2-9305-434d-bf70-7e0ba206b7e6',
       '[{"source_image_url":"","name":"Fawn Chestnut","code":"01W","image_id":null},{"source_image_url":"","name":"Cedar Chestnut","code":"02W","image_id":null},{"source_image_url":"","name":"Knotted Chestnut","code":"03W","image_id":null},{"source_image_url":"","name":"Earthen Chestnut","code":"04W","image_id":null},{"source_image_url":"","name":"Silverstone Chestnut","code":"07W","image_id":null},{"source_image_url":"","name":"Doeskin Chestnut","code":"08W","image_id":null}]',
       'Mohawk Industries',
       '{"rating":"AC4","finish":"Embossed in register (EIR)"}',
       'Rare Vintage — CDL74 by Mohawk Industries. Laminate flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Rare Vintage — CDL74',
       'laminate',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Mohawk Industries') AND lower(name) = lower('Rare Vintage — CDL74'))
ON CONFLICT(id) DO NOTHING;

-- Lee Flooring: Coastal Driftwood — 705
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT 'dc35b8d6-6195-4bc0-a633-1e58d5421da4',
       '[{"source_image_url":"","name":"Coastal Driftwood","code":"705","image_id":null}]',
       'Lee Flooring',
       '{"construction":"SPC","width":"7 1/4 in","length":"48 in","thickness":"5 mm + 2 mm EVA","coverage":"19.23 sq. ft.","installation":"Drop click"}',
       'Coastal Driftwood — 705 by Lee Flooring. Luxury vinyl flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Coastal Driftwood — 705',
       'vinyl',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Lee Flooring') AND lower(name) = lower('Coastal Driftwood — 705'))
ON CONFLICT(id) DO NOTHING;

-- Forbo: Marmoleum Solid
INSERT INTO products (id, colours, brand, specifications, description, image_id, image_alt, published, name, category_id, price_cents, price_unit, featured)
SELECT '943ef952-7dd3-48ac-ad05-37b4345bde23',
       '[{"source_image_url":"","name":"Titan","code":"3761","image_id":null}]',
       'Forbo',
       '{"material":"Linoleum"}',
       'Marmoleum Solid by Forbo. Linoleum flooring. Contact First Choice Carpets for samples, current availability and installation.',
       NULL,
       '',
       0,
       'Marmoleum Solid',
       'linoleum',
       NULL,
       '',
       0
WHERE NOT EXISTS (SELECT 1 FROM products WHERE lower(brand) = lower('Forbo') AND lower(name) = lower('Marmoleum Solid'))
ON CONFLICT(id) DO NOTHING;
