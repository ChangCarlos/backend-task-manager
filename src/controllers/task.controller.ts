import { NextFunction, Request, Response } from "express";
import * as service from "../services/task.service";

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const taskData = await service.create(req.body, userId);
    res.status(201).json(taskData);
  } catch (error) {
    next(error);
  }
}

export async function getTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const { page, limit, search, completed, orderBy, order } = req.query;

    const result = await service.list({
      userId,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      completed: completed === "true" ? true : completed === "false" ? false : undefined,
      orderBy: orderBy as "createdAt" | "updatedAt" | "title" | undefined,
      order: order as "asc" | "desc" | undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const task = await service.getById(req.params.id, userId);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    const updatedTask = await service.update(req.params.id, req.body, userId);
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.userId;
    await service.deleteTask(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
