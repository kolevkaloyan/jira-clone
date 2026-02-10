import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from "typeorm";
import { User } from "./User";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  action!: string; // e.g., "TASK_UPDATED"

  @Column()
  entityType!: string; // e.g., "Task"

  @Column()
  entityId!: string;

  @Column({ type: "jsonb", nullable: true })
  payload!: any; // Stores the before/after change

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User)
  user!: User;
}
