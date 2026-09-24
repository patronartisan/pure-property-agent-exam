import type { Agent, AgentInput, PageError, PropertyNote, PropertyView, Reminder } from "./types";

const API_BASE = "/api/agents";

type ErrorPayload = {
  error?: {
    message?: string;
    code?: string;
    details?: string[];
  };
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: string[];

  constructor(message: string, status: number, code?: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toPageError(err: unknown): PageError {
  if (err instanceof ApiError) {
    return { message: err.message, details: err.details };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Request failed" };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return { data: null } as T;
  }

  const payload = (await response.json().catch(() => null)) as ErrorPayload | T | null;

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload | null;
    throw new ApiError(
      errorPayload?.error?.message || `Request failed with status ${response.status}`,
      response.status,
      errorPayload?.error?.code,
      errorPayload?.error?.details
    );
  }

  return payload as T;
}

export function listAgents() {
  return fetch(API_BASE).then((response) => parseResponse<{ data: Agent[] }>(response));
}

export function upsertAgent(agent: AgentInput) {
  return fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agent),
  }).then((response) => parseResponse<{ data: Agent; created: boolean }>(response));
}

export function updateAgent(id: string, agent: AgentInput) {
  return fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agent),
  }).then((response) => parseResponse<{ data: Agent }>(response));
}

export function listProperties() {
  return fetch("/api/properties").then((response) => parseResponse<{ data: PropertyView[] }>(response));
}

export function createPropertyNote(propertyId: string, note: { title: string; body: string }) {
  return fetch(`/api/properties/${propertyId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }).then((response) => parseResponse<{ data: PropertyNote }>(response));
}

export function createPropertyReminder(
  propertyId: string,
  reminder: { title: string; actionType: string; dueAt: string }
) {
  return fetch(`/api/properties/${propertyId}/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reminder),
  }).then((response) => parseResponse<{ data: Reminder }>(response));
}
