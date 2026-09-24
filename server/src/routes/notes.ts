import type { NextFunction, Request, Response, Router } from "express";
import { validationError } from "../httpError";
import * as noteStore from "../store/noteStore";
import * as agentStore from "../store/agentStore";

function validateNotePayload(body: unknown) {
  const errors: string[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: ["Request body must be a JSON object"] };
  }

  const data = body as { title?: unknown; body?: unknown };

  if (typeof data.title !== "string" || !data.title.trim()) {
    errors.push("title is required");
  } else if (data.title.trim().length > 200) {
    errors.push("title must be at most 200 characters");
  }

  if (typeof data.body !== "string" || !data.body.trim()) {
    errors.push("body is required");
  }

  return { valid: errors.length === 0, errors };
}

function requireAgent(req: Request, res: Response) {
  const agent = agentStore.getById(req.params.id);
  if (!agent) {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Agent not found" },
    });
    return null;
  }
  return agent;
}

export function registerNoteRoutes(router: Router) {
  router.get("/:id/notes", (req: Request, res: Response) => {
    if (!requireAgent(req, res)) {
      return;
    }

    res.json({ data: noteStore.listByAgent(req.params.id) });
  });

  router.post("/:id/notes", (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireAgent(req, res)) {
        return;
      }

      const { valid, errors } = validateNotePayload(req.body);
      if (!valid) {
        throw validationError(errors);
      }

      const note = noteStore.create(req.params.id, req.body);
      res.status(201).json({ data: note });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id/notes/:noteId", (req: Request, res: Response) => {
    if (!requireAgent(req, res)) {
      return;
    }

    const note = noteStore.getById(req.params.noteId);
    if (!note || note.agentId !== req.params.id) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Note not found" },
      });
    }

    noteStore.remove(req.params.noteId);
    res.status(204).send();
  });
}
