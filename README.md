# PURE — Property Agent Desk

Full-stack exercise: a property agent manages rental properties, each occupied by one family with one or more tenants. Agents keep notes and reminders for work such as maintenance and pest control.

The required brief is **in-memory Agent CRUD** plus a Vue upsert form. The running API also serves seeded properties, notes, and reminders. There is no database. The backend is **Node.js, Express, and TypeScript**. The web client is **Vue 3**.

## What is in this repo

| Path | Purpose |
| --- | --- |
| [`docs/data-model.md`](docs/data-model.md) | Tables, constraints, relationships, mermaid ER diagram |
| [`docs/data-model.html`](docs/data-model.html) | Visual ER diagram — open in a browser |
| [`docs/api.md`](docs/api.md) | REST contract plus curl examples |
| [`server/`](server/) | TypeScript Express API, in-memory store |
| [`client/`](client/) | Vue 3 desk (dashboard, properties, add agent, settings) |

## Run it

Needs Node.js 18 or newer. Use two terminals.

```bash
cd server
npm install
npm start
```

```bash
cd client
npm install
npm run dev
```

- API: [http://localhost:3000](http://localhost:3000)
- Vue form: [http://localhost:5173](http://localhost:5173)

The Vite dev server proxies `/api` to port 3000.

## Agent attributes

| Field | Notes |
| --- | --- |
| `id` | UUID, assigned by the server |
| `firstName` | Required |
| `lastName` | Required |
| `email` | Required, unique, stored lowercase |
| `mobileNumber` | Required |
| `createdAt` | ISO timestamp, set on create |
| `updatedAt` | ISO timestamp, set on every write |

## API

| Method | Path | Action |
| --- | --- | --- |
| `GET` | `/api/agents` | List all |
| `GET` | `/api/agents/:id` | View one |
| `PUT` | `/api/agents` | Upsert / create (Add Agent form) |
| `PUT` | `/api/agents/:id` | Update one (Settings) |
| `DELETE` | `/api/agents/:id` | Delete one |
| `GET` | `/api/properties` | List properties (Vue Properties) |
| `GET` | `/api/properties/:id` | View one property (not used by Vue) |
| `POST` | `/api/properties/:id/notes` | Add a property note |
| `POST` | `/api/properties/:id/reminders` | Add a property reminder |
| `GET/POST` | `/api/agents/:id/notes` | Agent-only notes (not used by Vue) |
| `DELETE` | `/api/agents/:id/notes/:noteId` | Delete an agent-only note |

List, view, and delete of agents, plus view of one property (`GET /api/properties/:id`), are shown with curl in [`docs/api.md`](docs/api.md) (or the same URLs in Postman). There is no Postman collection file in the repo.

## Vue client

The dashboard shows the current seed agent. Properties lists the agent’s rentals, each with one family, tenants, notes, and reminders. Add Agent upserts by email (`PUT /api/agents`) and stays on the form. Settings updates the current agent by id.

- Dashboard: [http://localhost:5173](http://localhost:5173)
- Properties: [http://localhost:5173/properties](http://localhost:5173/properties)
- Add Agent: [http://localhost:5173/agents/new](http://localhost:5173/agents/new)
- Settings: [http://localhost:5173/settings](http://localhost:5173/settings)

## Stretch goal

**Email uniqueness and payload validation on the server.**

The brief did not ask for uniqueness or format checks. They are included because an agent’s email is the natural business key: without a unique constraint you can create duplicate people, and without validation the store will accept unusable records.

What was added:

- Unique email (`409 DUPLICATE_EMAIL`)
- Format checks for email and mobile (`400 VALIDATION_ERROR` with field details)
- Upsert-by-email so the form can create or update without the user first looking up an id

## Error handling (for the session)

Both layers should participate, for different reasons.

**Backend (source of truth)**

- Reject invalid or incomplete payloads.
- Enforce unique email.
- Return stable error codes and HTTP status values (`400`, `404`, `409`).
- Never trust the client. The API can be called from Postman, curl, or another app.

**Frontend (experience)**

- Required attributes and basic format checks so the user gets immediate feedback.
- Show the server’s message and field details when a request fails.
- Do not be the only place validation lives. A user can bypass the form.

A practical split: the form prevents obvious mistakes; the API remains the last and authoritative check.

## Data model in brief

- `agents` 1 — * `properties`
- `families` 1 — * `properties` (one family occupies a property)
- `properties` 1 — * `tenants` (at least one; all from that family)
- `agents` 1 — * `notes` and `reminders`, each tied to a property

Full tables, keys, and delete rules: [`docs/data-model.md`](docs/data-model.md).
