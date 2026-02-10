import { Column, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { User } from "./User";
import { UserOrganization } from "./UserOrganization";
import { Project } from "./Project";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Project, (project) => project.organization)
  projects!: string;

  @OneToMany(() => UserOrganization, (userOrg) => userOrg.organization)
  memberships!: UserOrganization[];

  @ManyToMany(() => User)
  employees!: User[];
}
