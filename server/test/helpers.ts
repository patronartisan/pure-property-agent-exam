import request from "supertest";
import { createApp } from "../src/app";
import * as agentStore from "../src/store/agentStore";
import * as noteStore from "../src/store/noteStore";
import * as propertyStore from "../src/store/propertyStore";

export const validAgent = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  mobileNumber: "+61 400 111 222",
};

export function resetStores() {
  agentStore.reset();
  noteStore.reset();
  propertyStore.reset();
  agentStore.seed();
  propertyStore.seed(agentStore.list()[0]);
}

export function api() {
  return request(createApp());
}
