import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { api, resetStores, validAgent } from "./helpers";

const seedEmail = "propertyagent@pure.com";

describe("GET /api/agents", () => {
  beforeEach(resetStores);

  it("lists the seed agent", async () => {
    const response = await api().get("/api/agents");
    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].email, seedEmail);
  });
});

describe("GET /api/agents/:id", () => {
  beforeEach(resetStores);

  it("returns one agent", async () => {
    const listed = await api().get("/api/agents");
    const id = listed.body.data[0].id;
    const response = await api().get(`/api/agents/${id}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, id);
    assert.equal(response.body.data.email, seedEmail);
  });

  it("returns 404 for an unknown id", async () => {
    const response = await api().get("/api/agents/does-not-exist");
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });
});

describe("PUT /api/agents", () => {
  beforeEach(resetStores);

  it("creates an agent when the email is new", async () => {
    const response = await api().put("/api/agents").send(validAgent);
    assert.equal(response.status, 201);
    assert.equal(response.body.created, true);
    assert.equal(response.body.data.firstName, "Ada");
    assert.equal(response.body.data.email, "ada@example.com");
    assert.ok(response.body.data.id);
    assert.ok(response.body.data.createdAt);
    assert.ok(response.body.data.updatedAt);
  });

  it("stores email in lowercase", async () => {
    const response = await api()
      .put("/api/agents")
      .send({ ...validAgent, email: "Ada@Example.COM" });
    assert.equal(response.status, 201);
    assert.equal(response.body.data.email, "ada@example.com");
  });

  it("updates the matching agent when the email already exists", async () => {
    const response = await api()
      .put("/api/agents")
      .send({
        firstName: "Updated",
        lastName: "Agent",
        email: seedEmail,
        mobileNumber: "+61 400 000 001",
      });
    assert.equal(response.status, 200);
    assert.equal(response.body.created, false);
    assert.equal(response.body.data.firstName, "Updated");
    assert.equal(response.body.data.email, seedEmail);
  });

  it("rejects an invalid payload", async () => {
    const response = await api().put("/api/agents").send({ firstName: "Ada" });
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
    assert.ok(Array.isArray(response.body.error.details));
  });

  it("rejects invalid JSON", async () => {
    const response = await api()
      .put("/api/agents")
      .set("Content-Type", "application/json")
      .send("{");
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });
});

describe("PUT /api/agents/:id", () => {
  beforeEach(resetStores);

  it("updates an agent by id", async () => {
    const listed = await api().get("/api/agents");
    const id = listed.body.data[0].id;
    const response = await api()
      .put(`/api/agents/${id}`)
      .send({
        firstName: "Patched",
        lastName: "Agent",
        email: seedEmail,
        mobileNumber: "+61 400 000 002",
      });
    assert.equal(response.status, 200);
    assert.equal(response.body.data.firstName, "Patched");
    assert.equal(response.body.data.id, id);
  });

  it("returns 404 for an unknown id", async () => {
    const response = await api().put("/api/agents/does-not-exist").send(validAgent);
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });

  it("rejects a duplicate email on another agent", async () => {
    const created = await api().put("/api/agents").send(validAgent);
    const listed = await api().get("/api/agents");
    const seed = listed.body.data.find((agent: { email: string }) => agent.email === seedEmail);
    const response = await api()
      .put(`/api/agents/${seed.id}`)
      .send({
        firstName: "Property",
        lastName: "Agent",
        email: created.body.data.email,
        mobileNumber: "+61 400 000 000",
      });
    assert.equal(response.status, 409);
    assert.equal(response.body.error.code, "DUPLICATE_EMAIL");
  });
});

describe("DELETE /api/agents/:id", () => {
  beforeEach(resetStores);

  it("deletes an agent", async () => {
    const listed = await api().get("/api/agents");
    const id = listed.body.data[0].id;
    const response = await api().delete(`/api/agents/${id}`);
    assert.equal(response.status, 204);
    const after = await api().get("/api/agents");
    assert.equal(after.body.data.length, 0);
  });

  it("returns 404 for an unknown id", async () => {
    const response = await api().delete("/api/agents/does-not-exist");
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });
});

describe("unknown routes", () => {
  it("returns 404", async () => {
    const response = await api().get("/api/does-not-exist");
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "NOT_FOUND");
  });
});
