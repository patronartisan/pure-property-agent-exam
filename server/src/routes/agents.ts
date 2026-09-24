import express from "express";
import { validationError } from "../httpError";
import * as store from "../store/agentStore";
import * as noteStore from "../store/noteStore";
import type { AgentInput } from "../types";
import { validateAgentPayload } from "../validators/agentValidator";
import { registerNoteRoutes } from "./notes";

const router = express.Router();

registerNoteRoutes(router);

router.get("/", (_req, res) => {
  res.json({ data: store.list() });
});

router.get("/:id", (req, res) => {
  const agent = store.getById(req.params.id);
  if (!agent) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Agent not found" },
    });
  }

  res.json({ data: agent });
});

router.put("/:id", (req, res, next) => {
  try {
    const { valid, errors } = validateAgentPayload(req.body);
    if (!valid) {
      throw validationError(errors);
    }

    const agent = store.update(req.params.id, req.body as AgentInput);
    if (!agent) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Agent not found" },
      });
    }

    res.json({ data: agent });
  } catch (err) {
    next(err);
  }
});

router.put("/", (req, res, next) => {
  try {
    const { valid, errors } = validateAgentPayload(req.body);
    if (!valid) {
      throw validationError(errors);
    }

    const { agent, created } = store.upsert(req.body as AgentInput);
    res.status(created ? 201 : 200).json({ data: agent, created });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", (req, res) => {
  const existing = store.getById(req.params.id);
  if (!existing) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Agent not found" },
    });
  }

  noteStore.removeByAgent(req.params.id);
  store.remove(req.params.id);
  res.status(204).send();
});

export default router;
