import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Unique,
  ManyToOne
} from "typeorm";
import { Task } from "./Task";
import { Organization } from "./Organization";

@Entity("tags")
@Unique(["name", "organization"])
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ default: "grey" })
  color!: string;

  @ManyToOne(() => Organization)
  organization!: Organization;

  @ManyToMany(() => Task, (task) => task.tags)
  tasks!: Task[];
}
