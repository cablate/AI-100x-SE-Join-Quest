import { ProjectData } from "./types";
import { User } from "./User";

export class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly ownerId: string;
  public readonly createdAt: Date;

  constructor(id: string, name: string, owner: User) {
    this.id = id;
    this.name = name;
    this.ownerId = owner.id;
    this.createdAt = new Date();
  }

  toData(): ProjectData {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
    };
  }
}
