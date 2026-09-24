import { randomUUID } from "crypto";
import type { AgentNote } from "../types";

const notes = new Map<string, AgentNote>();

function now() {
  return new Date().toISOString();
}

function clone(note: AgentNote) {
  return { ...note };
}

export function listAll() {
  return Array.from(notes.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(clone);
}

export function listByAgent(agentId: string) {
  return listAll().filter((note) => note.agentId === agentId);
}

export function getById(id: string) {
  const note = notes.get(id);
  return note ? clone(note) : null;
}

export function create(agentId: string, data: { title: string; body: string }) {
  const timestamp = now();
  const note: AgentNote = {
    id: randomUUID(),
    agentId,
    title: data.title.trim(),
    body: data.body.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  notes.set(note.id, note);
  return clone(note);
}

export function remove(id: string) {
  return notes.delete(id);
}

export function reset() {
  notes.clear();
}

export function removeByAgent(agentId: string) {
  for (const [id, note] of notes.entries()) {
    if (note.agentId === agentId) {
      notes.delete(id);
    }
  }
}
