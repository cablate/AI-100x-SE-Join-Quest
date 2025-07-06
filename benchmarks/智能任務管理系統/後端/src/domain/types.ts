// 基本類型定義
export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  creatorId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
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
  ownerId: string;
  createdAt: Date;
}
