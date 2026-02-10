import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Organization } from "./Organization";

export enum OrganizationRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member"
}

@Entity("user_organizations")
export class UserOrganization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER
  })
  role!: OrganizationRole;

  @ManyToOne(() => User, (user) => user.memberships)
  user!: User;

  @ManyToOne(() => Organization, (org) => org.memberships)
  organization!: Organization;
}
