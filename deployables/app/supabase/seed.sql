INSERT INTO
  "Tenant" ("id", "name")
VALUES
  (
    'bf7b4a60-e573-4823-bae4-50e9947cb3dd',
    'ACME Org'
  );

INSERT INTO
  "Feature" ("name")
VALUES
  ('user-management');

INSERT INTO
  "ActiveFeature" ("tenantId", "featureId")
SELECT
  "Tenant"."id",
  "Feature"."id"
FROM
  "Tenant",
  "Feature";