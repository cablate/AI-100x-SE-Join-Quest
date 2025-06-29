import { Customer as ICustomer } from "./types";

export class Customer implements ICustomer {
  constructor(public id: string, public isVIP: boolean) {}
}
