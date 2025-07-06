import { TaskData } from "./types";

export class Task {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly projectId: string;
  public readonly creatorId: string;
  public readonly assigneeId: string;
  public readonly status: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string, title: string, description: string, projectId: string, creatorId: string, assigneeId?: string, status?: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.projectId = projectId;
    this.creatorId = creatorId;
    this.assigneeId = assigneeId || creatorId; // 創建者自動成為負責人
    this.status = status || "TODO"; // 預設狀態
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // 更新任務方法
  update(updates: { title?: string; description?: string }): Task {
    return new Task(this.id, updates.title || this.title, updates.description || this.description, this.projectId, this.creatorId, this.assigneeId, this.status);
  }

  toData(): TaskData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      projectId: this.projectId,
      creatorId: this.creatorId,
      assigneeId: this.assigneeId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
