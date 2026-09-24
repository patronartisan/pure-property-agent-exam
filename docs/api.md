# Property Agent REST API

Base URL: `http://localhost:3000`

All agent payloads use:

```json
{
  "id": "uuid",
  "firstName": "Property",
  "lastName": "Agent",
  "email": "propertyagent@pure.com",
  "mobileNumber": "+61 400 000 000",
  "createdAt": "2026-09-24T04:00:00.000Z",
  "updatedAt": "2026-09-24T04:00:00.000Z"
}
```

`createdAt` and `updatedAt` are set by the server. Email is stored in lowercase and must be unique. Data is kept in memory and resets when the API restarts.

**Vue client**

- Add Agent (`/agents/new`) calls `PUT /api/agents` (upsert) and stays on the form.
- Settings (`/settings`) calls `PUT /api/agents/:id` for the current seed agent.
- Properties (`/properties`) calls `GET /api/properties` and can `POST` notes and reminders. It does not call `GET /api/properties/:id`.
- List, view-by-id, and delete of agents, and view of one property, are not in the Vue UI - use the curl examples below (or the same URLs in Postman). There is no Postman collection file in the repo.

---

## Upsert

`PUT /api/agents`

Used by the Vue Add Agent form.

- No `id` and a new email → create (`201`, `created: true`)
- No `id` and an existing email → update that agent (`200`, `created: false`)
- `id` present → update that agent (`200`), or `404` if missing

```bash
curl -i -X PUT http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Property",
    "lastName": "Agent",
    "email": "propertyagent@pure.com",
    "mobileNumber": "+61 400 000 001"
  }'
```

---

## List all agents

Show this request in Postman or curl. The Vue client does not include a list view.

`GET /api/agents`

```bash
curl -i http://localhost:3000/api/agents
```

Expected: `200` with `{ "data": [ ...agents ] }`.

One seed agent is loaded when the server starts: Property Agent (`propertyagent@pure.com`).

---

## View a single agent

`GET /api/agents/:id`

Replace the id with a value from the list response.

```bash
curl -i http://localhost:3000/api/agents/AGENT_ID
```

Expected: `200` with `{ "data": { ...agent } }`, or `404` if the id does not exist.

```bash
curl -i http://localhost:3000/api/agents/does-not-exist
```

---

## Update by id

`PUT /api/agents/:id`

Used by the Vue Settings form.

```bash
curl -i -X PUT http://localhost:3000/api/agents/AGENT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Property",
    "lastName": "Agent",
    "email": "propertyagent@pure.com",
    "mobileNumber": "+61 400 000 002"
  }'
```

---

## Delete a single agent

Show this request in Postman or curl. The Vue client does not include a delete button.

`DELETE /api/agents/:id`

Removes the agent and any agent-only notes (`/api/agents/:id/notes`). It does **not** remove seeded properties, tenants, property notes, or reminders, and it does **not** reject the delete when those properties still exist.

```bash
curl -i -X DELETE http://localhost:3000/api/agents/AGENT_ID
```

Expected: `204` with an empty body, or `404` if the id does not exist.

```bash
curl -i -X DELETE http://localhost:3000/api/agents/does-not-exist
```

---

## Properties

Seeded when the server starts (two rentals, three tenants, sample notes and reminders), attached to the seed agent.

`GET /api/properties`

```bash
curl -i http://localhost:3000/api/properties
```

Expected: `200` with `{ "data": [ ...properties ] }`. Each property includes nested `family`, `tenants`, `notes`, and `reminders`.

`GET /api/properties/:id`

Show this request in Postman or curl. The Vue client lists properties with `GET /api/properties` and does not call this route.

```bash
curl -i http://localhost:3000/api/properties/PROPERTY_ID
```

Expected: `200` with `{ "data": { ...property } }`, or `404` if missing.

---

## Property notes

Used by the Vue Properties modal.

`POST /api/properties/:id/notes`

```bash
curl -i -X POST http://localhost:3000/api/properties/PROPERTY_ID/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kitchen tap",
    "body": "Slow drip at the mixer."
  }'
```

Expected: `201` with `{ "data": { ...note } }`. The note includes `agentId` and `propertyId`.

---

## Property reminders

Used by the Vue Properties modal. `actionType` is any non-empty string up to 50 characters (for example `maintenance`, `pest_control`, `inspection`, `other`, or a custom value).

`POST /api/properties/:id/reminders`

```bash
curl -i -X POST http://localhost:3000/api/properties/PROPERTY_ID/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quarterly pest control",
    "actionType": "pest_control",
    "dueAt": "2026-10-01T09:00:00.000Z"
  }'
```

Expected: `201` with `{ "data": { ...reminder } }`.

---

## Agent-only notes

Not used by the Vue client. These notes have **no** `propertyId`.

`GET /api/agents/:id/notes` - notes for one agent.

`POST /api/agents/:id/notes`

```bash
curl -i -X POST http://localhost:3000/api/agents/AGENT_ID/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Call owner",
    "body": "Confirm inspection window."
  }'
```

`DELETE /api/agents/:id/notes/:noteId` - `204` or `404`.

---

## Error shapes

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": ["email must be a valid email address"]
  }
}
```

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Missing/invalid fields or invalid JSON body |
| 404 | `NOT_FOUND` | Unknown agent, property, note, or route |
| 409 | `DUPLICATE_EMAIL` | Email already used by another agent (update to a taken email) |
| 500 | `INTERNAL_ERROR` | Unexpected server failure |
