import { TaskData } from "./types";

export class Task {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly projectId: string;
  public readonly creatorId: string;
  public readonly assigneeId: string;
  public readonly status: string;
  public readonly priority: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string, title: string, description: string, projectId: string, creatorId: string, assigneeId?: string, status?: string, priority?: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.projectId = projectId;
    this.creatorId = creatorId;
    this.assigneeId = assigneeId || creatorId; // 創建者自動成為負責人
    this.status = status || "TODO"; // 預設狀態
    this.priority = priority || "medium"; // 預設優先級
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // 更新任務方法
  update(updates: { title?: string; description?: string; status?: string; priority?: string; assigneeId?: string }): Task {
    return new Task(this.id, updates.title || this.title, updates.description || this.description, this.projectId, this.creatorId, updates.assigneeId || this.assigneeId, updates.status || this.status, updates.priority || this.priority);
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
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
