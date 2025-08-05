INSERT INTO
  "User" ("id", "fullName", "externalId", "nonce")
VALUES
  (
    '10ad9e2a-f7b0-4068-87ae-d4871edb7083',
    'Test User',
    'user_01JW8GNG1T6YJJ07KWAP0X8G3W',
    (random() * 2147483648)::bigint * 4294967296 + (random() * 4294967296)::bigint
  );

INSERT INTO
  "Tenant" ("name", "createdById")
VALUES
  (
    'ACME Org',
    '10ad9e2a-f7b0-4068-87ae-d4871edb7083'
  );

INSERT INTO
  "SubscriptionPlan" ("name", "isDefault", "priority")
VALUES
  ('free', TRUE, 0);