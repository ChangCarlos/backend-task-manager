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
  page?: number;
  limit?: number;
  search?: string;
  completed?: boolean;
  orderBy?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
}

export interface PaginatedTasks {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}