# Link Addition RLS Error fix

## Context
When users try to add a website link (or an image) during the configurator references step, they receive a "failed to add a link" error. In the Supabase database logs, this shows up as a `42501` Row-Level Security violation.

## Root Cause
In PostgreSQL, an `INSERT` policy using `WITH CHECK` evaluates against the **new** row being inserted. 

Prior to this fix, the policy (`Users can insert references via session token or studio`) used:
```sql
WHERE b.id = blueprint_references.blueprint_id
```

Because `blueprint_references` refers to the table state before the insert, and the row doesn't exist yet, `blueprint_references.blueprint_id` resolves to `NULL`. The condition fails, and the insert is rejected.

## The Fix
You must refer to the bare column name of the new row that is being checked. The `20260222000000_fix_blueprint_references_insert_policy.sql` migration simply drops the policy and recreates it using `blueprint_id` instead of `blueprint_references.blueprint_id`.

```sql
WHERE b.id = blueprint_id
```

## Self-Verification
An automated script `.agent/scripts/test_blueprint_references_rls.js` was created to test this via the `x-blueprint-token` just like the frontend UI does. Future agents can run this script via:
```bash
npx tsx --env-file=.env .agent/scripts/test_blueprint_references_rls.js
```
If it passes, RLS for references is functioning properly.
