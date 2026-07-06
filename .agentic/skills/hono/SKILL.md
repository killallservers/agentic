---
name: hono
description: >
  Ultrafast, lightweight web framework for building APIs and full-stack applications on Bun.
  Use Hono whenever you need to build HTTP APIs, serverless functions, or full-stack apps with type-safe routing, middleware, authentication, and database integration.
  Covers routing patterns, middleware (auth, CORS, compression), Drizzle ORM integration, validation, file uploads, JSX rendering, and deployment on Bun.
compatibility: "Bun 1.0+, TypeScript, Drizzle ORM, Zod/Valibot validators"
references:
  - https://hono.dev
  - https://hono.dev/llms-full.txt
---

## What is Hono?

Hono is an ultrafast, lightweight web framework built on Web Standards. It's designed for APIs, serverless functions, and full-stack applications across multiple runtimes — but this skill focuses on **Bun**, where Hono shines as the fastest, smallest HTTP framework available.

**Key advantages on Bun:**
- **Tiny footprint**: ~14KB (vs Express at 572KB) — perfect for edge computing mindset
- **Type-safe routing**: Full TypeScript support with literal type inference for URL parameters
- **High performance**: RegExpRouter matches all routes with a single compiled regex
- **Zero-config middleware**: Built-in auth, CORS, compression, validation
- **Standards-based**: Uses Request/Response Web APIs — portable if you ever need other runtimes

## Core Architecture

### Files & Configuration

```
my-api/
├── src/
│   ├── index.ts           (entry point)
│   ├── routes/
│   │   ├── api/
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   └── [id].ts
│   │   └── index.ts
│   ├── middleware/        (custom auth, logging, etc.)
│   ├── db.ts             (Drizzle setup)
│   └── types.ts
├── bunfig.toml
└── package.json
```

### Installation

```bash
bun add hono
```

Optional but recommended:
```bash
bun add drizzle-orm drizzle-kit
bun add zod valibot              # validators
bun add better-auth              # auth provider
```

## Quick Start: Basic API

```typescript
import { Hono } from 'hono';

const app = new Hono();

// GET /
app.get('/', (c) => c.text('Hello, Hono!'));

// JSON response
app.get('/api/users', (c) => {
  return c.json({ users: [{ id: 1, name: 'Alice' }] });
});

// Route parameter with type safety
app.get('/api/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id, name: `User ${id}` });
});

// POST with JSON body
app.post('/api/users', async (c) => {
  const body = await c.req.json();
  return c.json({ created: body }, { status: 201 });
});

// Start server
export default app;
```

Run with Bun:
```bash
bun run src/index.ts
# Starts on http://localhost:3000
```

## Routing Patterns

### Dynamic routes

```typescript
// URL parameters
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id });
});

// Multiple parameters
app.get('/posts/:postId/comments/:commentId', (c) => {
  const { postId, commentId } = c.req.param();
  return c.json({ postId, commentId });
});

// Catch-all routes
app.get('/docs/*', (c) => {
  return c.text('Documentation page');
});
```

### HTTP methods

```typescript
app.get('/resource', handler);      // GET
app.post('/resource', handler);     // POST
app.put('/resource/:id', handler);  // PUT
app.patch('/resource/:id', handler); // PATCH
app.delete('/resource/:id', handler); // DELETE
app.head('/resource', handler);     // HEAD
app.options('/resource', handler);  // OPTIONS
```

### Route groups

```typescript
const api = new Hono();

api.get('/users', (c) => c.json({ users: [] }));
api.post('/users', (c) => c.json({ created: true }));

const app = new Hono();
app.route('/api', api);  // Mounts at /api/*
```

## Context Object

The `Context` object (`c`) is your interface to requests, responses, and request-scoped state:

```typescript
app.get('/', (c) => {
  // Request
  const method = c.req.method;
  const url = c.req.url;
  const query = c.req.query('key');           // ?key=value
  const param = c.req.param('id');            // :id
  
  // Query object (all params as Record)
  const allParams = c.req.param();
  
  // Body parsing
  const json = await c.req.json();
  const text = await c.req.text();
  const form = await c.req.formData();
  
  // Headers
  const auth = c.req.header('authorization');
  const contentType = c.req.header('content-type');
  
  // Response
  return c.json({ data: 'value' });
  return c.text('Plain text');
  return c.html('<h1>HTML</h1>');
  return c.body('raw body');
  
  // Status & headers
  return c.json({ error: 'Not found' }, { status: 404 });
  return c.json(data, {
    status: 200,
    headers: { 'X-Custom': 'value' }
  });
});
```

## Middleware

Middleware runs before route handlers. Apply globally or to specific routes:

### Global middleware

```typescript
const app = new Hono();

// Runs on every request, before any route
app.use('*', (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`);
  return next();
});

app.get('/', (c) => c.text('Hello'));
```

### Route-specific middleware

```typescript
// Middleware only for /api/* routes
app.use('/api/*', authMiddleware);

// Run middleware, then handler
app.get('/api/protected', (c) => c.json({ secret: 'data' }));
```

### Pattern: Middleware stack

```typescript
const authMiddleware = (c, next) => {
  const auth = c.req.header('authorization');
  if (!auth) return c.text('Unauthorized', { status: 401 });
  c.set('user', { id: 1, name: 'Alice' });
  return next();
};

const loggingMiddleware = (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  return next();
};

const app = new Hono();
app.use('*', loggingMiddleware);
app.use('/api/*', authMiddleware);
```

## Built-in Middleware

Hono includes powerful, zero-config middleware for common tasks:

### Authentication

**Basic Auth:**
```typescript
import { basicAuth } from 'hono/basic-auth';

app.use('/api/*', basicAuth({
  username: 'admin',
  password: 'secret',
}));

app.get('/api/protected', (c) => c.json({ protected: true }));
```

**Bearer Token:**
```typescript
import { bearer } from 'hono/bearer-auth';

app.use('/api/*', bearer({
  verifyToken: async (token, c) => {
    return token === 'valid-token-123';
  }
}));
```

**JWT:**
```typescript
import { jwt } from 'hono/jwt';

app.use('/api/*', jwt({
  secret: 'your-secret-key',
}));

app.get('/api/protected', (c) => {
  const payload = c.get('jwtPayload');
  return c.json({ user: payload.sub });
});
```

### Security & Headers

**CORS:**
```typescript
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: ['https://example.com', 'https://app.example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

**Compression:**
```typescript
import { compress } from 'hono/compress';

app.use('*', compress());  // gzip, deflate, brotli

app.get('/data', (c) => c.json({ data: 'large response' }));
```

**CSRF Protection:**
```typescript
import { csrf } from 'hono/csrf';

app.use('*', csrf());
```

**Secure Headers:**
```typescript
import { secureHeaders } from 'hono/secure-headers';

app.use('*', secureHeaders());  // Sets CSP, X-Frame-Options, etc.
```

### Request Processing

**Body size limit:**
```typescript
app.post('/upload', async (c) => {
  // Hono enforces Content-Length limits
  const body = await c.req.json();
  return c.json({ received: body });
});
```

**Cookie handling:**
```typescript
import { getCookie, setCookie } from 'hono/cookie';

app.get('/', (c) => {
  const session = getCookie(c, 'session_id');
  setCookie(c, 'session_id', 'new-value', {
    maxAge: 3600,
    secure: true,
    httpOnly: true,
  });
  return c.json({ ok: true });
});
```

**ETag (caching):**
```typescript
import { etag } from 'hono/etag';

app.use('*', etag());

app.get('/api/users', (c) => c.json({ users: [...] }));
```

## Database Integration with Drizzle

Set up Drizzle ORM with Bun's SQLite for type-safe queries:

### Schema

```typescript
// src/db.ts
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer().primaryKey(),
  email: text().unique().notNull(),
  name: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).default(new Date()),
});

export const posts = sqliteTable('posts', {
  id: integer().primaryKey(),
  userId: integer().references(() => users.id),
  title: text().notNull(),
  content: text(),
  published: integer({ mode: 'boolean' }).default(false),
  createdAt: integer({ mode: 'timestamp' }).default(new Date()),
});

const db = drizzle(new Bun.SQLiteDatabase('db.sqlite'));

export default db;
```

### Queries in routes

```typescript
import db, { users, posts } from './db';
import { eq } from 'drizzle-orm';

// GET /api/users
app.get('/api/users', async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

// GET /api/users/:id
app.get('/api/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const user = await db.select().from(users).where(eq(users.id, id));
  
  if (user.length === 0) {
    return c.json({ error: 'Not found' }, { status: 404 });
  }
  return c.json(user[0]);
});

// POST /api/users
app.post('/api/users', async (c) => {
  const { email, name } = await c.req.json();
  const result = await db.insert(users).values({ email, name });
  return c.json(result, { status: 201 });
});

// PUT /api/users/:id
app.put('/api/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const { name } = await c.req.json();
  await db.update(users).set({ name }).where(eq(users.id, id));
  return c.json({ updated: true });
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(users).where(eq(users.id, id));
  return c.json({ deleted: true });
});
```

## Validation & Error Handling

### Zod validation

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

app.post('/api/users', async (c) => {
  const body = await c.req.json();
  
  try {
    const data = CreateUserSchema.parse(body);
    // data is now typed: { email: string; name: string }
    const result = await db.insert(users).values(data);
    return c.json(result, { status: 201 });
  } catch (error) {
    return c.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
});
```

### Custom error handler

```typescript
type Env = {
  Variables: {
    userId?: number;
  };
};

const app = new Hono<Env>();

app.onError((error, c) => {
  console.error('Error:', error);
  
  // Custom error responses
  if (error instanceof z.ZodError) {
    return c.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
  }
  
  return c.json({ error: 'Internal server error' }, { status: 500 });
});

app.get('/api/users/:id', async (c) => {
  throw new Error('Something went wrong');
  // Caught by onError
});
```

## File Uploads

```typescript
app.post('/api/upload', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file');
  
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, { status: 400 });
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return c.json({ error: 'Only images allowed' }, { status: 400 });
  }
  
  // Save to disk
  const buffer = await file.arrayBuffer();
  const path = `./uploads/${file.name}`;
  await Bun.write(path, buffer);
  
  return c.json({ uploaded: file.name });
});
```

## Type Safety with Context

Create a typed Env to carry request-scoped data:

```typescript
type AppEnv = {
  Variables: {
    userId: number;
    userRole: 'admin' | 'user';
  };
};

const app = new Hono<AppEnv>();

const authMiddleware = (c, next) => {
  c.set('userId', 1);
  c.set('userRole', 'admin');
  return next();
};

app.use('*', authMiddleware);

app.get('/api/protected', (c) => {
  const userId = c.get('userId');      // typed as number
  const role = c.get('userRole');      // typed as 'admin' | 'user'
  return c.json({ userId, role });
});
```

## Full-Stack with JSX

Hono can render JSX for server-side HTML:

```typescript
import { html } from 'hono/html';

app.get('/', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <h1>Hello from Hono</h1>
        <p>Built on ${c.env.FRAMEWORK || 'Bun'}</p>
      </body>
    </html>
  `);
});
```

Or with a React-like component:

```typescript
const Layout = (props) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${props.title}</title>
    </head>
    <body>
      ${props.children}
    </body>
  </html>
`;

app.get('/about', (c) => {
  return c.html(Layout({ title: 'About', children: html`<h1>About Us</h1>` }));
});
```

## Production on Bun

### Running the server

```typescript
// src/index.ts
import { serve } from 'hono/bun';
import app from './app';

serve({
  fetch: app.fetch,
  port: process.env.PORT || 3000,
});
```

**package.json**:
```json
{
  "name": "my-api",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build ./src/index.ts --outfile ./dist/index.js --target bun",
    "start": "bun ./dist/index.js"
  }
}
```

Run it:
```bash
# Development
bun run dev

# Production build
bun run build

# Run production build
bun run start
```

### Environment variables

```typescript
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'default-key';
const DB_PATH = process.env.DB_PATH || 'db.sqlite';

const app = new Hono();

app.get('/config', (c) => {
  return c.json({
    port: PORT,
    apiKeySet: !!API_KEY,
    dbPath: DB_PATH,
  });
});
```

Create `.env.local`:
```
PORT=3000
API_KEY=your-secret-key
DB_PATH=data/app.db
```

Load with:
```bash
bun run --env-file=.env.local src/index.ts
```

## Best Practices

**1. Organize routes into modules**
```typescript
// routes/users.ts
const router = new Hono();

router.get('/', (c) => c.json({ users: [] }));
router.post('/', (c) => c.json({ created: true }));

export default router;

// src/index.ts
import users from './routes/users';
const app = new Hono();
app.route('/api/users', users);
```

**2. Separate middleware, routes, database**
```
src/
├── index.ts          (app setup)
├── middleware/       (auth, logging, etc.)
├── routes/           (API endpoints)
├── db.ts             (Drizzle setup)
└── types.ts          (TypeScript types)
```

**3. Type your routes**
```typescript
app.post<{
  out: { userId: number };
}>(
  '/api/users',
  async (c) => {
    const { email, name } = await c.req.json();
    const user = await createUser(email, name);
    return c.json({ userId: user.id });
  }
);
```

**4. Validate all inputs**
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/register', async (c) => {
  const body = await c.req.json();
  const data = schema.parse(body);  // Throws if invalid
  // Now safe to use
});
```

**5. Handle errors explicitly**
```typescript
app.get('/api/users/:id', async (c) => {
  const id = c.req.param('id');
  
  if (!id || isNaN(parseInt(id))) {
    return c.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, parseInt(id)),
  });
  
  if (!user) {
    return c.json({ error: 'Not found' }, { status: 404 });
  }
  
  return c.json(user);
});
```

**6. Use middleware for cross-cutting concerns**
```typescript
// Not this (repeated in every handler)
app.get('/api/users/:id', async (c) => {
  if (!auth) return c.text('Unauthorized', { status: 401 });
  // ...
});

// Do this (middleware)
app.use('/api/*', authMiddleware);
app.get('/api/users/:id', async (c) => {
  // Already authorized
});
```

## Key Points to Remember

- **Ultra-lightweight**: Hono on Bun gives you ~14KB framework with best-in-class performance
- **Context is everything**: `c` is your interface to request/response/state
- **Middleware first**: Define middleware before routes
- **Type safety**: Use TypeScript + Zod/Valibot for runtime safety
- **Drizzle integration**: Type-safe database queries with Drizzle ORM
- **No magic**: Built on Web Standards (Request/Response) — very portable
- **One process**: Single Bun process handles the entire API
- **Environment abstraction**: Use env vars and `.env.local` for config

## Edge Cases & Gotchas

### Route Matching Complexity

**Problem:** Deep route trees become slow or unpredictable

**Symptom:**
```typescript
app.get('/api/v1/users/:id/posts/:postId/comments/:commentId/likes')
// Many nested routes → linear matching time
```

**Solution:**
- Limit nesting depth (3 levels max)
- Use route parameters instead: `/api/resources/:id`
- Query parameters for filtering: `/api/posts?authorId=123&limit=10`

### Middleware Ordering

**Problem:** Middleware runs in wrong order, breaking logic

**Symptom:**
```typescript
app.use(authMiddleware)
app.use(loggingMiddleware)  // Logs before auth? Logging sees unauthenticated requests
```

**Solution:**
- Define middleware BEFORE routes
- Order matters: global → auth → logging → routes
- Use app.use() for global, app.get(middleware, ...) for route-specific

### Streaming Response + Middleware

**Problem:** Middleware tries to read body after streaming starts

**Symptom:**
```typescript
app.post('/upload', middleware, async (c) => {
  return c.streamText(...)  // Middleware already read body!
})
```

**Solution:**
- Streaming middleware must be route-specific
- Don't parse body in global middleware for streaming routes
- Use conditional checks: `if (!isStreamingRoute) { parseBody() }`

### Error Recovery in Middleware Chains

**Problem:** Error in middleware leaves response partially sent

**Symptom:**
```typescript
app.use(async (c, next) => {
  try {
    await next()
  } catch (err) {
    // Body already sent, can't change status
    return c.text('Error', 500)  // Too late!
  }
})
```

**Solution:**
- Error handling middleware must be FIRST
- Use onError hook: `app.onError((err, c) => {})`
- Return proper error response

### CORS + Authentication Interaction

**Problem:** CORS headers interfere with auth, or vice versa

**Symptom:**
```typescript
// CORS blocks auth headers
app.use(cors({ origin: '*' }))  // Allows all, but...
app.use(authMiddleware)  // Auth checks Authorization header
// Preflight request fails?
```

**Solution:**
```typescript
// CORS first, with proper config
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,  // Allow credentials (cookies, auth headers)
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Auth second
app.use(authMiddleware)
```

## Anti-Patterns

### ❌ Don't: Put middleware logic in routes

```typescript
// Bad: auth logic repeated in every route
app.get('/api/users', async (c) => {
  const user = await checkAuth()  // Repeated
  if (!user) return c.text('Unauthorized', 401)
  // ...
})

// Good: use middleware
app.use(requireAuth)  // Once
app.get('/api/users', async (c) => {
  const user = c.get('user')  // Already authenticated
  // ...
})
```

### ❌ Don't: Middleware for business logic

```typescript
// Bad: business logic in middleware
app.use(async (c, next) => {
  const user = await findUser(userId)
  if (user.premium) {
    // Do something special
  }
  await next()
})

// Good: business logic in route handler
app.get('/api/premium-feature', async (c) => {
  const user = c.get('user')
  if (!user.isPremium) return c.text('Not available', 403)
  // Logic here
})
```

### ❌ Don't: Forget route documentation

```typescript
// Bad: routes with no description
app.post('/api/process', handler)
app.get('/api/results/:id', handler)

// Good: self-documenting
app.post('/api/process', { description: 'Start async process' }, handler)
app.get('/api/results/:id', { description: 'Get process result by ID' }, handler)
```

### ❌ Don't: Use global middleware for streaming routes

```typescript
// Bad: global body parser + streaming route
app.use(bodyParser())  // Reads body globally
app.post('/upload', streamHandler)  // Expects readable stream, body already consumed
```

```typescript
// Good: skip body parsing for streaming routes
app.use(bodyParser())
app.post('/upload', skipMiddleware([bodyParser]), streamHandler)
```
