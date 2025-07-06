import { UserData } from "./types";

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly createdAt: Date;

  constructor(id: string, email: string, name?: string) {
    this.id = id;
    this.email = email;
    this.name = name || id;
    this.createdAt = new Date();
  }

  toData(): UserData {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    };
  }
}
