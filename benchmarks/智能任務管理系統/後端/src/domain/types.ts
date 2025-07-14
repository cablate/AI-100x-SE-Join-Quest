// 基本類型定義
export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  creatorId: string;
  status?: string;
  priority?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  updatedBy: string;
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  projectId: string;
  creatorId: string;
  assigneeId: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  ownerId: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
  updatedBy: string;
}
