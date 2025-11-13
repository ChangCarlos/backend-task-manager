import prisma from "../lib/prisma";
import { Task, ListTasksParams, CursorPaginatedTasks } from "../interfaces/task.interface";
import { NotFoundError, ForbiddenError } from "../utils/errors";

export async function create(
  taskData: {
    title: string;
    description?: string;
  },
  userId: string,
): Promise<Task> {
  const newTask = await prisma.task.create({
    data: {
      title: taskData.title,
      description: taskData.description || "",
      userId,
    },
  });

  return newTask;
}


export async function list(params: ListTasksParams): Promise<CursorPaginatedTasks> {
  const {
    userId,
    cursor,
    limit = 10,
    search,
    completed,
    orderBy = "createdAt",
    order = "desc",
  } = params;

  const where: any = {
    userId,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (completed !== undefined) {
    where.completed = completed;
  }

  if (cursor && (orderBy === "createdAt" || orderBy === "updatedAt")) {
    try {
      const cursorDate = new Date(cursor);
      where[orderBy] = order === "desc" ? { lt: cursorDate } : { gt: cursorDate };
    } catch (e) {
    }
  }

  const tasks = await prisma.task.findMany({
    where,
    take: limit + 1,
    orderBy: {
      [orderBy]: order,
    },
  });

  const hasMore = tasks.length > limit;
  
  const data = hasMore ? tasks.slice(0, limit) : tasks;
  
  let nextCursor: string | null = null;
  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];
    const cursorValue = lastItem[orderBy];
    nextCursor = cursorValue instanceof Date ? cursorValue.toISOString() : String(cursorValue);
  }

  return {
    data,
    nextCursor,
    hasMore,
    limit,
  };
}

export async function getById(id: string, userId: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  if (task.userId !== userId) {
    throw new ForbiddenError("You don't have permission to access this task");
  }

  return task;
}

export async function update(
  id: string,
  updateData: Partial<{
    title: string;
    description: string;
    completed: boolean;
  }>,
  userId: string,
): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  if (task.userId !== userId) {
    throw new ForbiddenError("You don't have permission to update this task");
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  return updatedTask;
}

export async function deleteTask(id: string, userId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  if (task.userId !== userId) {
    throw new ForbiddenError("You don't have permission to delete this task");
  }

  await prisma.task.delete({
    where: { id },
  });

  return true;
}
