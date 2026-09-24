export type Agent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentInput = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
};

export type Family = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Tenant = {
  id: string;
  propertyId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PropertyNote = {
  id: string;
  agentId: string;
  propertyId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Reminder = {
  id: string;
  agentId: string;
  propertyId: string;
  title: string;
  actionType: string;
  dueAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PropertyView = {
  id: string;
  agentId: string;
  familyId: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
  family: Family | null;
  tenants: Tenant[];
  notes: PropertyNote[];
  reminders: Reminder[];
};

export type PageError = {
  message: string;
  details?: string[];
};
