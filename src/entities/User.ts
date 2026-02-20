import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinTable
} from "typeorm";
import { Organization } from "./Organization";
import { UserOrganization } from "./UserOrganization";

export enum UserRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member"
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.user)
  memberships!: UserOrganization[];

  @Column({ nullable: true })
  fullName?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.MEMBER
  })
  role!: UserRole;

  @Column({ default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => Organization)
  @JoinTable()
  organization!: Organization;
}
