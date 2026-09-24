import { randomUUID } from "crypto";
import type {
  Agent,
  Family,
  Property,
  PropertyNote,
  PropertyView,
  Reminder,
  Tenant,
} from "../types";

const families = new Map<string, Family>();
const properties = new Map<string, Property>();
const tenants = new Map<string, Tenant>();
const notes = new Map<string, PropertyNote>();
const reminders = new Map<string, Reminder>();

function now() {
  return new Date().toISOString();
}

function clone<T extends object>(value: T) {
  return { ...value };
}

function addFamily(name: string) {
  const timestamp = now();
  const family: Family = {
    id: randomUUID(),
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  families.set(family.id, family);
  return family;
}

function addProperty(data: {
  agentId: string;
  familyId: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}) {
  const timestamp = now();
  const property: Property = {
    id: randomUUID(),
    agentId: data.agentId,
    familyId: data.familyId,
    streetAddress: data.streetAddress,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  properties.set(property.id, property);
  return property;
}

function addTenant(data: {
  propertyId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isPrimary: boolean;
}) {
  const timestamp = now();
  const tenant: Tenant = {
    id: randomUUID(),
    propertyId: data.propertyId,
    familyId: data.familyId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    mobileNumber: data.mobileNumber,
    isPrimary: Boolean(data.isPrimary),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  tenants.set(tenant.id, tenant);
  return tenant;
}

function addNote(data: { agentId: string; propertyId: string; title: string; body: string }) {
  const timestamp = now();
  const note: PropertyNote = {
    id: randomUUID(),
    agentId: data.agentId,
    propertyId: data.propertyId,
    title: data.title,
    body: data.body,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  notes.set(note.id, note);
  return note;
}

function addReminder(data: {
  agentId: string;
  propertyId: string;
  title: string;
  actionType: string;
  dueAt: string;
  completedAt?: string | null;
}) {
  const timestamp = now();
  const reminder: Reminder = {
    id: randomUUID(),
    agentId: data.agentId,
    propertyId: data.propertyId,
    title: data.title,
    actionType: data.actionType,
    dueAt: data.dueAt,
    completedAt: data.completedAt || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  reminders.set(reminder.id, reminder);
  return reminder;
}

function assemble(property: Property): PropertyView {
  const family = families.get(property.familyId);
  return {
    ...clone(property),
    family: family ? clone(family) : null,
    tenants: Array.from(tenants.values())
      .filter((tenant) => tenant.propertyId === property.id)
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      .map(clone),
    notes: Array.from(notes.values())
      .filter((note) => note.propertyId === property.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone),
    reminders: Array.from(reminders.values())
      .filter((reminder) => reminder.propertyId === property.id)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      .map(clone),
  };
}

export function list() {
  return Array.from(properties.values())
    .sort((a, b) => a.streetAddress.localeCompare(b.streetAddress))
    .map(assemble);
}

export function getById(id: string) {
  const property = properties.get(id);
  return property ? assemble(property) : null;
}

export function createNote(propertyId: string, data: { title: string; body: string }) {
  const property = properties.get(propertyId);
  if (!property) {
    return null;
  }

  return clone(
    addNote({
      agentId: property.agentId,
      propertyId,
      title: data.title.trim(),
      body: data.body.trim(),
    })
  );
}

export function createReminder(
  propertyId: string,
  data: { title: string; actionType: string; dueAt: string }
) {
  const property = properties.get(propertyId);
  if (!property) {
    return null;
  }

  return clone(
    addReminder({
      agentId: property.agentId,
      propertyId,
      title: data.title.trim(),
      actionType: data.actionType,
      dueAt: data.dueAt,
    })
  );
}

export function seed(agent?: Agent) {
  if (!agent || properties.size > 0) {
    return;
  }

  const santos = addFamily("Santos");
  const okonkwo = addFamily("Okonkwo");

  const birch = addProperty({
    agentId: agent.id,
    familyId: santos.id,
    streetAddress: "42 Birch Street",
    city: "Fitzroy",
    state: "VIC",
    postalCode: "3065",
  });

  const quarry = addProperty({
    agentId: agent.id,
    familyId: okonkwo.id,
    streetAddress: "9 Quarry Road",
    city: "Brunswick",
    state: "VIC",
    postalCode: "3056",
  });

  addTenant({
    propertyId: birch.id,
    familyId: santos.id,
    firstName: "Roj",
    lastName: "Santos",
    email: "roj.santos@example.com",
    mobileNumber: "+61 412 101 220",
    isPrimary: true,
  });

  addTenant({
    propertyId: birch.id,
    familyId: santos.id,
    firstName: "Luis",
    lastName: "Santos",
    email: "luis.santos@example.com",
    mobileNumber: "+61 412 101 221",
    isPrimary: false,
  });

  addTenant({
    propertyId: quarry.id,
    familyId: okonkwo.id,
    firstName: "Chidi",
    lastName: "Okonkwo",
    email: "chidi.okonkwo@example.com",
    mobileNumber: "+61 400 773 118",
    isPrimary: true,
  });

  addNote({
    agentId: agent.id,
    propertyId: birch.id,
    title: "Kitchen tap",
    body: "Slow drip at the kitchen mixer. Book a plumber before the next inspection.",
  });

  addNote({
    agentId: agent.id,
    propertyId: quarry.id,
    title: "Rear fence",
    body: "Fence leans after the last storm. Check with the owner before quoting a replacement.",
  });

  const inFiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const inTwelveDays = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();

  addReminder({
    agentId: agent.id,
    propertyId: birch.id,
    title: "Quarterly pest control",
    actionType: "pest_control",
    dueAt: inFiveDays,
  });

  addReminder({
    agentId: agent.id,
    propertyId: quarry.id,
    title: "Gutter and roof check",
    actionType: "maintenance",
    dueAt: inTwelveDays,
  });
}
