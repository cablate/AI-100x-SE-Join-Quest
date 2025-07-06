import { ProjectData } from "./types";

export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly ownerId: string;
  public readonly status: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(id: string, name: string, description: string, ownerId: string, status?: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ownerId = ownerId;
    this.status = status || "active";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // 更新專案方法
  update(updates: { name?: string; description?: string; status?: string }): Project {
    return new Project(
      this.id,
      updates.name || this.name,
      updates.description || this.description,
      this.ownerId,
      updates.status || this.status
    );
  }

  toData(): ProjectData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
