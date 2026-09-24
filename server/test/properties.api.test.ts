import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { api, resetStores } from "./helpers";

describe("GET /api/properties", () => {
  beforeEach(resetStores);

  it("lists seeded properties with family, tenants, notes, and reminders", async () => {
    const response = await api().get("/api/properties");
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    const birch = response.body.data.find(
      (property: { streetAddress: string }) => property.streetAddress === "42 Birch Street"
    );
    assert.ok(birch);
    assert.equal(birch.family.name, "Santos");
    assert.equal(birch.tenants.length, 2);
    assert.equal(birch.tenants[0].firstName, "Roj");
    assert.ok(birch.notes.length >= 1);
    assert.ok(birch.reminders.length >= 1);
  });
});

describe("GET /api/properties/:id", () => {
  beforeEach(resetStores);

  it("returns one property", async () => {
    const listed = await api().get("/api/properties");
    const id = listed.body.data[0].id;
    const response = await api().get(`/api/properties/${id}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, id);
  });

  it("returns 404 for an unknown id", async () => {
    const response = await api().get("/api/properties/does-not-exist");
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });
});

describe("POST /api/properties/:id/notes", () => {
  beforeEach(resetStores);

  it("adds a note to a property", async () => {
    const listed = await api().get("/api/properties");
    const id = listed.body.data[0].id;
    const response = await api()
      .post(`/api/properties/${id}/notes`)
      .send({ title: "Lock change", body: "Tenant requested a new lock." });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.title, "Lock change");
    assert.equal(response.body.data.propertyId, id);
  });

  it("rejects a missing title", async () => {
    const listed = await api().get("/api/properties");
    const id = listed.body.data[0].id;
    const response = await api()
      .post(`/api/properties/${id}/notes`)
      .send({ body: "No title" });
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("returns 404 for an unknown property", async () => {
    const response = await api()
      .post("/api/properties/does-not-exist/notes")
      .send({ title: "Lock change", body: "Tenant requested a new lock." });
    assert.equal(response.status, 404);
  });
});

describe("POST /api/properties/:id/reminders", () => {
  beforeEach(resetStores);

  it("adds a reminder to a property", async () => {
    const listed = await api().get("/api/properties");
    const id = listed.body.data[0].id;
    const response = await api()
      .post(`/api/properties/${id}/reminders`)
      .send({
        title: "Smoke alarm check",
        actionType: "inspection",
        dueAt: "2026-10-01T09:00:00.000Z",
      });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.title, "Smoke alarm check");
    assert.equal(response.body.data.actionType, "inspection");
    assert.equal(response.body.data.propertyId, id);
  });

  it("rejects an invalid due date", async () => {
    const listed = await api().get("/api/properties");
    const id = listed.body.data[0].id;
    const response = await api()
      .post(`/api/properties/${id}/reminders`)
      .send({
        title: "Smoke alarm check",
        actionType: "inspection",
        dueAt: "not-a-date",
      });
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });
});

describe("agent-only notes", () => {
  beforeEach(resetStores);

  it("creates, lists, and deletes a note for an agent", async () => {
    const listed = await api().get("/api/agents");
    const agentId = listed.body.data[0].id;

    const created = await api()
      .post(`/api/agents/${agentId}/notes`)
      .send({ title: "Call owner", body: "Confirm inspection window." });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.title, "Call owner");

    const notes = await api().get(`/api/agents/${agentId}/notes`);
    assert.equal(notes.status, 200);
    assert.equal(notes.body.data.length, 1);

    const removed = await api().delete(`/api/agents/${agentId}/notes/${created.body.data.id}`);
    assert.equal(removed.status, 204);

    const after = await api().get(`/api/agents/${agentId}/notes`);
    assert.equal(after.body.data.length, 0);
  });
});
