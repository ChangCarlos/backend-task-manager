export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListTasksParams {
  userId: string;
  cursor?: string;
  limit?: number;
  search?: string;
  completed?: boolean;
  orderBy?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
}

export interface CursorPaginatedTasks {
  data: Task[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}