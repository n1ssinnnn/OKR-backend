export interface UserProps {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId?: string | null;
    role?: string | null;
    departmentId: string;
    department: string;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

export class User {
  public readonly id: string;
  public name: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public roleId?: string | null;
  public role?: string | null;
  public departmentId: string;
  public department: string;
  public readonly createdAt: Date;
  public updatedAt?: Date | null;
  public deletedAt?: Date | null;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.roleId = props.roleId;
    this.role = props.role;
    this.departmentId = props.departmentId;
    this.department = props.department;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  // สามารถเพิ่ม Business Logic Methods ของ User ตรงนี้ได้ในอนาคต
  public isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }
}

export type Department = {
    id: string;
    name: string;
    createdAt: Date;
};