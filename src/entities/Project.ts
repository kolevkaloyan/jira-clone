import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Organization } from "./Organization";
import { Task } from "./Task";

@Entity("project")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Organization, (organization) => organization.projects)
  organization!: Organization;

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}
