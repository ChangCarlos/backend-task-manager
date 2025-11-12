import prisma from "../lib/prisma";
import { Task, ListTasksParams, PaginatedTasks } from "../interfaces/task.interface";
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


export async function list(params: ListTasksParams): Promise<PaginatedTasks> {
  const {
    userId,
    page = 1,
    limit = 20,
    search,
    completed,
    orderBy = "createdAt",
    order = "desc",
  } = params;

  const skip = (page - 1) * limit;

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

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [orderBy]: order,
      },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
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
