import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAgentPayload } from "../src/validators/agentValidator";
import { validAgent } from "./helpers";

describe("validateAgentPayload", () => {
  it("accepts a complete agent", () => {
    const result = validateAgentPayload(validAgent);
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it("rejects a missing body", () => {
    const result = validateAgentPayload(null);
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("Request body must be a JSON object"));
  });

  it("rejects missing required fields", () => {
    const result = validateAgentPayload({});
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes("firstName")));
    assert.ok(result.errors.some((error) => error.includes("lastName")));
    assert.ok(result.errors.some((error) => error.includes("email")));
    assert.ok(result.errors.some((error) => error.includes("mobileNumber")));
  });

  it("rejects an invalid email", () => {
    const result = validateAgentPayload({ ...validAgent, email: "not-an-email" });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("email must be a valid email address"));
  });

  it("rejects an invalid mobile number", () => {
    const result = validateAgentPayload({ ...validAgent, mobileNumber: "not-a-phone" });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("mobileNumber must be a valid phone number"));
  });
});
