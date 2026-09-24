const API_BASE = "/api/agents";

async function parseResponse(response) {
  if (response.status === 204) {
    return { data: null };
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = payload?.error?.code;
    error.details = payload?.error?.details;
    throw error;
  }

  return payload;
}

export function listAgents() {
  return fetch(API_BASE).then(parseResponse);
}

export function upsertAgent(agent) {
  return fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agent),
  }).then(parseResponse);
}

export function updateAgent(id, agent) {
  return fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agent),
  }).then(parseResponse);
}

export function listProperties() {
  return fetch("/api/properties").then(parseResponse);
}

export function createPropertyNote(propertyId, note) {
  return fetch(`/api/properties/${propertyId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  }).then(parseResponse);
}

export function createPropertyReminder(propertyId, reminder) {
  return fetch(`/api/properties/${propertyId}/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reminder),
  }).then(parseResponse);
}
