---
name: drizzle-orm
description: Generate Drizzle ORM 1.x code for Bun SQLite. Use this whenever a user mentions Drizzle, databases, schemas, queries, or needs help with database code. Covers schema generation, type-safe queries, Relational Queries v2, migrations (Folders v3), relations, and setup — all for Drizzle 1.x (use latest beta if not released). Always use this skill when the user is working with Drizzle on Bun or needs database code generation in TypeScript.
compatibility: TypeScript, Bun runtime, Drizzle 1.x (beta or stable)
---

## ⚠️ Version Requirement

**Always use Drizzle 1.x** — If 1.0 is not yet stable, use the latest 1.x beta release. Do NOT use 0.x series.

```bash
bun add drizzle-orm@latest drizzle-kit@latest
```

## What Drizzle 1.x does

Drizzle is a lightweight (~7.4kb), zero-dependency TypeScript ORM built for serverless. Version 1.x includes major improvements:
- **Type-safe SQL**: Full autocomplete and type inference for queries
- **Relational Queries v2**: Unified `defineRelations()` with many-to-many support via `through()`, relation filtering, and nested pagination
- **Zero boilerplate**: Schemas define tables and generate types automatically
- **Multi-database**: PostgreSQL, MySQL, SQLite, SingleStore, CockroachDB, MSSQL with full 1.x support
- **Folders v3 Migrations**: Cleaner migration structure, no journal.json, eliminates Git conflicts
- **Serverless-ready**: Designed for edge functions and serverless environments
- **drizzle-kit Rewrite**: 10x faster introspection (10s → <1s), better diff detection

## Core patterns

### Schema declaration (Bun SQLite example)
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer().primaryKey(),
  email: text().unique().notNull(),
  name: text(),
  createdAt: integer({ mode: 'timestamp' }).default(new Date()),
});

export const posts = sqliteTable('posts', {
  id: integer().primaryKey(),
  userId: integer().references(() => users.id),
  title: text().notNull(),
  content: text(),
  published: integer({ mode: 'boolean' }).default(false),
});
```

### Queries (type-safe)
```typescript
import { drizzle } from 'drizzle-orm/bun-sqlite';

const db = drizzle(new Bun.SQLiteDatabase('db.sqlite'));

// Select with autocomplete and type inference
const allUsers = await db.select().from(users);
const usersByEmail = await db.select().from(users).where(eq(users.email, 'test@example.com'));

// Joins
const postsWithAuthors = await db
  .select({ post: posts, author: users })
  .from(posts)
  .innerJoin(users, eq(posts.userId, users.id));

// Insert
await db.insert(users).values({ email: 'new@example.com', name: 'Alice' });

// Update
await db.update(users).set({ name: 'Bob' }).where(eq(users.id, 1));

// Delete
await db.delete(posts).where(eq(posts.id, 1));
```

### Relations (Relational Queries v2)
```typescript
import { defineRelations, defineSchema, one, many } from 'drizzle-orm';

// Define all relations in one place for better organization
export const schema = defineSchema({
  users: users,
  posts: posts,
  comments: comments,
  likes: likes,
});

export const relations = defineRelations({
  users: {
    posts: many({
      to: posts,
      from: users.id,
      relationName: 'author', // alias for the reverse side
    }),
    comments: many({ to: comments, from: users.id }),
    likes: many({ to: likes, from: users.id }),
  },
  posts: {
    author: one({
      to: users,
      from: posts.userId,
      relationName: 'posts', // reverse alias
    }),
    comments: many({ to: comments, from: posts.id }),
    likes: many({ to: likes, from: posts.id }),
  },
  comments: {
    post: one({ to: posts, from: comments.postId }),
    author: one({ to: users, from: comments.userId }),
  },
  likes: {
    post: one({ to: posts, from: likes.postId }),
    user: one({ to: users, from: likes.userId }),
  },
});

// Query with relations (auto-completion on related fields)
const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: { posts: true, comments: true },
});

// Filter by related objects (new in v2)
const postsWithComments = await db.query.posts.findMany({
  where: (fields, operators) => 
    operators.gt(fields.comments.count(), 0),
  with: { comments: true },
});
```

## Standard package.json Scripts

**Always include these four scripts in package.json.** These are the standard Drizzle Kit commands:

```json
{
  "scripts": {
    "db:pull": "drizzle-kit pull",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

- `db:pull`: Introspect database and update schema (when database is source of truth)
- `db:push`: Push schema changes to development database
- `db:generate`: Generate migrations from schema changes
- `db:migrate`: Apply migrations in production

### Migrations with Drizzle Kit (Folders v3)
```bash
# Generate initial migrations
bun run db:generate --init

# Generate new migration after schema changes
bun run db:generate --name add_posts_table

# Push to database (development)
bun run db:push

# Migrate in production
bun run db:migrate
```

drizzle.config.ts (1.x):
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle/migrations', // Folders v3: migrations go in subfolders
  dialect: 'sqlite',
  dbCredentials: {
    url: './db.sqlite',
  },
  // Migrate on startup (optional)
  migrations: {
    table: '__drizzle_migrations__',
    schema: 'public',
  },
});
```

**Folders v3 Structure** (replaces journal.json):
```
drizzle/
├── migrations/
│   ├── 0000_initial/
│   │   └── migration.sql
│   ├── 0001_add_posts_table/
│   │   └── migration.sql
│   └── ...
└── meta/
    └── _journal.json (metadata only, smaller)
```

## Bun setup

```typescript
import { drizzle } from 'drizzle-orm/bun-sqlite';

export const db = drizzle(new Bun.SQLiteDatabase('db.sqlite'));
```

## Breaking Changes (0.x → 1.x)

If migrating from 0.x to 1.x, be aware:
- **Relational Queries**: Changed from per-table `relations()` to centralized `defineRelations()`
- **Parameter names**: `relationName` → `alias`, `references` → `to`, `columns` → `from`
- **DrizzleConfig**: Now requires two additional generics
- **Imports**: Relation types moved to `drizzle-orm/_relations`
- **Migrations**: Structure changed to Folders v3 (no more journal.json)
- **PostgreSQL data types**: Array handling for intervals/timestamps corrected

**Migration path**: Use orm.drizzle.team's "Upgrade to v1.0" guides for detailed steps.

## Better-auth integration

When using **better-auth** with Drizzle, generate the auth schema with:
```bash
bun x --bun auth@latest generate
```

This ensures the generated auth schema (tables, columns, indexes) aligns with the version of better-auth you're using. Always run this before migrations when adding authentication.

Example setup:
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
});
```

For comprehensive auth setup, patterns, and best practices, see the **betterauth skill** in `.agentic/skills/betterauth/SKILL.md`.

## 1.x New Features

### Column Aliases (`.as()`)
```typescript
// Alias columns in queries
const postsWithAlias = await db.select({
  id: posts.id,
  title: posts.title,
  authorName: users.name.as('author'), // alias in result
}).from(posts).leftJoin(users, eq(posts.userId, users.id));

// Result: { id, title, authorName }
```

### Many-to-Many with `through()`
```typescript
// Explicit junction table for M2M relations
export const postTags = sqliteTable('post_tags', {
  postId: integer().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: integer().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.postId, table.tagId] })]);

// In relations
export const relations = defineRelations({
  posts: {
    tags: many({
      to: tags,
      through: postTags, // explicit junction table
      from: postTags.postId,
      relationName: 'taggedPosts',
    }),
  },
});

// Query with M2M
const postWithTags = await db.query.posts.findFirst({
  where: eq(posts.id, 1),
  with: { tags: true }, // includes tags via postTags junction
});
```

## Common patterns

### Validation (with Zod)
```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Use in your API/handler
const parsed = insertUserSchema.parse(req.body);
await db.insert(users).values(parsed);
```

### Transactions
```typescript
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({ email: 'test@example.com' });
  await tx.insert(posts).values({ userId: user, title: 'First post' });
});
```

### Aggregations & counts
```typescript
const userCount = await db.select({ count: count() }).from(users);
const postsByUser = await db
  .select({ userId: posts.userId, count: count() })
  .from(posts)
  .groupBy(posts.userId);
```

## How to use this skill

When you see a prompt mentioning:
- "I need a Drizzle schema for..." → Generate a complete schema with relations
- "How do I query X in Drizzle?" → Provide type-safe query examples
- "Set up Drizzle with Bun" → Provide setup code and configuration
- "Drizzle migration" → Provide Drizzle Kit configuration and migration guidance
- Any database-related code task → Use Drizzle patterns and generate code

Always:
1. **Require Drizzle 1.x** — If 1.0 is not released, use the latest 1.x beta (e.g., v1.0.0-beta.22)
2. Use **Relational Queries v2** (defineRelations) — NOT the old relations() pattern
3. Use **Folders v3 migrations** with cleaner structure
4. Provide inline code examples with proper TypeScript types and imports
5. Use Bun's native SQLite (Bun.SQLiteDatabase)
6. Mention `bun x --bun auth@latest generate` when better-auth is involved
7. When migrating from 0.x, reference the breaking changes section above
8. Link to https://orm.drizzle.team (has "Upgrade to v1.0" guides)

## Edge Cases & Gotchas

### Migration with Schema Versioning

**Problem:** How do you track schema versions across migrations?

**Solution:**
```typescript
// migrations/0001_init.sql
CREATE TABLE schema_versions (id INT PRIMARY KEY, version VARCHAR(50));
INSERT INTO schema_versions VALUES (1, '0.0.1');

// migrations/0002_add_users.sql
ALTER TABLE schema_versions SET version = '0.0.2' WHERE id = 1;
```

Then query on startup: `SELECT version FROM schema_versions`

### Circular Relations

**Problem:** Table A references B, B references A

**Symptom:**
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id),
})

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').references(() => users.id),  // Circular!
})
```

**Solution:**
- One side gets the foreign key, other side has no reference
- Query through the key side: `db.query.users.findFirst({ with: { group: true } })`
- From groups: manual join or denormalize owner info

### Many-to-Many with Metadata

**Problem:** Junction table needs extra columns (e.g., timestamp of when relationship created)

**Solution:**
```typescript
// Don't try to add columns to many-to-many in defineRelations
// Instead: create explicit junction table with columns

export const userRoles = pgTable('user_roles', {
  userId: integer('user_id').references(() => users.id),
  roleId: integer('role_id').references(() => roles.id),
  assignedAt: timestamp('assigned_at').defaultNow(),
  // Custom columns!
})

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
}))
```

Query: `db.query.userRoles.findMany({ where: eq(userRoles.userId, 123) })`

### Lazy vs Eager Loading Performance

**Problem:** Lazy loading (`.with()`) causes N+1 queries

**Bad (N+1):**
```typescript
const users = await db.select().from(users)  // 1 query
for (const user of users) {
  const posts = await db.select().from(posts).where(eq(posts.userId, user.id))  // N queries
}
```

**Good (eager load):**
```typescript
const users = await db.query.users.findMany({
  with: { posts: true }  // 1 query with JOIN
})
```

### Rollback Scenarios

**Problem:** Migration fails in production, how to rollback?

**Drizzle migrations don't have built-in rollbacks.** Solution:

```typescript
// migrations/0001_add_column.sql
-- UP
ALTER TABLE users ADD COLUMN age INTEGER;

-- DOWN (in separate file or documentation)
ALTER TABLE users DROP COLUMN age;
```

Run `ALTER TABLE users DROP COLUMN age` separately to rollback.

Or create rollback script: `migrations/rollback/0001_drop_age.sql`

### Data Transformation During Migration

**Problem:** Changing column type requires transforming existing data

**Solution:**
```sql
-- Create new column with new type
ALTER TABLE users ADD COLUMN age_new INTEGER;

-- Transform data
UPDATE users SET age_new = CAST(age_text AS INTEGER);

-- Drop old column, rename new
ALTER TABLE users DROP COLUMN age;
ALTER TABLE users RENAME COLUMN age_new TO age;
```

## Anti-Patterns

### ❌ Don't: Use raw SQL in type-safe context

```typescript
// Bad: loses type safety
const result = await db.execute(sql`SELECT * FROM users WHERE id = ${id}`)

// Good: type-safe
const user = await db.query.users.findFirst({ where: eq(users.id, id) })
```

### ❌ Don't: Create circular foreign keys

```typescript
// Bad: A→B and B→A
export const users = pgTable('users', {
  groupId: integer('group_id').references(() => groups.id),
})

export const groups = pgTable('groups', {
  ownerId: integer('owner_id').references(() => users.id),
})
```

```typescript
// Good: One direction only
export const users = pgTable('users', {
  groupId: integer('group_id').references(() => groups.id),
})

export const groups = pgTable('groups', {
  // No reference back to users
})
```

### ❌ Don't: Mix Drizzle and raw SQL migrations

```bash
# Bad: Drizzle migration + manual SQL migration
bun drizzle-kit migrate
# Then manually: psql -c "ALTER TABLE..."
# Drizzle doesn't know about the change, out of sync
```

```bash
# Good: Use Drizzle for all migrations
# Edit schema.ts
bun drizzle-kit generate  # Generate migration
bun drizzle-kit migrate   # Run it
```

### ❌ Don't: Assume lazy relations are cached

```typescript
// Bad: N+1 if not careful
const users = await db.query.users.findMany()
users.forEach(async user => {
  const posts = await user.posts  // Separate query per user!
})

// Good: eager load
const users = await db.query.users.findMany({
  with: { posts: true }
})
```

## Documentation reference
- Full docs: https://orm.drizzle.team
- LLM reference: https://orm.drizzle.team/llms.txt
