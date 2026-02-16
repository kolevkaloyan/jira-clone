import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";
import { Project } from "./Project";
import { User } from "./User";
import { Tag } from "./Tag";
import { Comment } from "./Comment";

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done"
}

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status!: TaskStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: "CASCADE" })
  project!: Project;

  @ManyToOne(() => User, { nullable: true })
  assignee?: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.tasks)
  @JoinTable()
  tags!: Tag[];
}
