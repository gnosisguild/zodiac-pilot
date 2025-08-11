CREATE OR REPLACE FUNCTION pg_temp.random_string(int) RETURNS text
  AS $$ SELECT
    array_to_string(ARRAY(SELECT chr(ascii('B') + round(random() * 25)::integer)
    FROM
    generate_series(1, $1)), '') $$
  LANGUAGE sql;

ALTER TABLE "ActionAsset"
ADD COLUMN "allowanceKey" varchar(32);

UPDATE "ActionAsset"
SET
  "allowanceKey" = LOWER(pg_temp.random_string (32));

ALTER TABLE "ActionAsset"
ALTER COLUMN "allowanceKey"
SET
  NOT NULL;