# DB

This package abstracts the DB layer away.
It provides the schema for our applications and access methods to retrieve and modify data.

## Prerequisites

To run a local DB you'll need a container software like Docker.
However, others with a Docker compatible API also work.

## Starting the DB

When you run `pnpm start` a local [supabase](https://supabase.com/docs) instance will be started and seeded with some important data.
In the command output look for the "Studio URL".
This is an interface for the DB that lets you browse and change data.

## Create the test DB

When you first set up the DB open up the studio and navigate to the "SQL Editor".
The run:

```sql
CREATE DATABASE "zodiac-os-test";
```

This creates a separate database for tests that will be dropped after each test.

## Creating a migration

To create a new migration run `pnpm create-migration '<name of your migration>'`.
You typically run this command **after** you made changes to the [schema](./schema/index.ts).
The command will then automatically apply your changes.
However, you are free to edit the `sql` file afterwards to make any necessary adjustments.

Not that creating a migration **does not** automatically apply it.

## Applying a migration

When you start out with schema changes you might not want to immediately run a migration against your local DB but rather start with some test cases.
To **only** migrate the test DB run `pnpm migrate-test`.
This leaves your default local DB untouched but migrates the test database.
That way, you can already start writing tests against your new schema without messing up anything in your local setup.

Once you're satisfied with your changes run `pnpm migrate` to run all migrations against your local DB.

You don't have to worry about this for production and/or PRs. When you open up a PR the production DB will be branched and all migrations run against the branch.
You can then test around in the preview development.
