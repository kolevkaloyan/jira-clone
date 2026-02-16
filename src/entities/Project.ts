import {
  Column,
  CreateDateColumn,
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

  @Column({ length: 12 })
  key!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => Organization, (organization) => organization.projects)
  organization!: Organization;

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @CreateDateColumn()
  updatedAt!: Date;
}
