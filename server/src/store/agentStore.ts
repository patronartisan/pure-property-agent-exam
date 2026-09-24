import { randomUUID } from "crypto";
import { HttpError } from "../httpError";
import type { Agent, AgentInput } from "../types";

const agents = new Map<string, Agent>();

function now() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function clone(agent: Agent) {
  return { ...agent };
}

function findByEmail(email: string, excludeId?: string) {
  const normalized = normalizeEmail(email);
  for (const agent of agents.values()) {
    if (agent.email === normalized && agent.id !== excludeId) {
      return agent;
    }
  }
  return null;
}

export function list() {
  return Array.from(agents.values())
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(clone);
}

export function getById(id: string) {
  const agent = agents.get(id);
  return agent ? clone(agent) : null;
}

export function create(data: AgentInput) {
  if (findByEmail(data.email)) {
    throw new HttpError(409, "DUPLICATE_EMAIL", "An agent with this email already exists");
  }

  const timestamp = now();
  const agent: Agent = {
    id: randomUUID(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: normalizeEmail(data.email),
    mobileNumber: data.mobileNumber.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  agents.set(agent.id, agent);
  return clone(agent);
}

export function update(id: string, data: AgentInput) {
  const existing = agents.get(id);
  if (!existing) {
    return null;
  }

  if (data.email && findByEmail(data.email, id)) {
    throw new HttpError(409, "DUPLICATE_EMAIL", "An agent with this email already exists");
  }

  existing.firstName = data.firstName.trim();
  existing.lastName = data.lastName.trim();
  existing.email = normalizeEmail(data.email);
  existing.mobileNumber = data.mobileNumber.trim();
  existing.updatedAt = now();

  return clone(existing);
}

export function upsert(data: AgentInput) {
  if (data.id) {
    const updated = update(data.id, data);
    if (!updated) {
      throw new HttpError(404, "NOT_FOUND", "Agent not found");
    }
    return { agent: updated, created: false };
  }

  const match = findByEmail(data.email);
  if (match) {
    return { agent: update(match.id, data) as Agent, created: false };
  }

  return { agent: create(data), created: true };
}

export function remove(id: string) {
  return agents.delete(id);
}

export function reset() {
  agents.clear();
}

export function seed() {
  const sample = {
    firstName: "Property",
    lastName: "Agent",
    email: "propertyagent@pure.com",
    mobileNumber: "+61 400 000 000",
  };

  if (!findByEmail(sample.email)) {
    create(sample);
  }
}
