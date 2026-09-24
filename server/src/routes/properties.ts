import express, { type Request, type Response } from "express";
import { validationError } from "../httpError";
import * as propertyStore from "../store/propertyStore";

const router = express.Router();

function requireProperty(req: Request, res: Response) {
  const property = propertyStore.getById(req.params.id);
  if (!property) {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Property not found" },
    });
    return null;
  }
  return property;
}

router.get("/", (_req, res) => {
  res.json({ data: propertyStore.list() });
});

router.post("/:id/notes", (req, res, next) => {
  try {
    if (!requireProperty(req, res)) {
      return;
    }

    const body = (req.body || {}) as { title?: unknown; body?: unknown };
    const errors: string[] = [];
    if (typeof body.title !== "string" || !body.title.trim()) {
      errors.push("title is required");
    }
    if (typeof body.body !== "string" || !body.body.trim()) {
      errors.push("body is required");
    }
    if (errors.length) {
      throw validationError(errors);
    }

    const note = propertyStore.createNote(req.params.id, {
      title: String(body.title),
      body: String(body.body),
    });
    res.status(201).json({ data: note });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reminders", (req, res, next) => {
  try {
    if (!requireProperty(req, res)) {
      return;
    }

    const body = (req.body || {}) as {
      title?: unknown;
      actionType?: unknown;
      dueAt?: unknown;
    };
    const errors: string[] = [];
    if (typeof body.title !== "string" || !body.title.trim()) {
      errors.push("title is required");
    }
    if (typeof body.actionType !== "string" || !body.actionType.trim()) {
      errors.push("actionType is required");
    } else if (body.actionType.trim().length > 50) {
      errors.push("actionType must be at most 50 characters");
    }
    if (typeof body.dueAt !== "string" || Number.isNaN(Date.parse(body.dueAt))) {
      errors.push("dueAt must be a valid date");
    }
    if (errors.length) {
      throw validationError(errors);
    }

    const reminder = propertyStore.createReminder(req.params.id, {
      title: String(body.title),
      actionType: String(body.actionType).trim(),
      dueAt: new Date(String(body.dueAt)).toISOString(),
    });
    res.status(201).json({ data: reminder });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", (req, res) => {
  const property = propertyStore.getById(req.params.id);
  if (!property) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Property not found" },
    });
  }

  res.json({ data: property });
});

export default router;
