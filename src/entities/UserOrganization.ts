import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Organization } from "./Organization";

export enum OrganizationRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member"
}

export enum EnrollmentStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
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

  @Column({
    type: "enum",
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING
  })
  status!: EnrollmentStatus;

  @ManyToOne(() => User, (user) => user.memberships)
  user!: User;

  @ManyToOne(() => Organization, (org) => org.memberships)
  organization!: Organization;
}
