import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from "typeorm";

@Entity("audit_logs")
@Index(["userId"])
@Index(["entityName"])
@Index(["createdAt"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", nullable: true })
  userId!: string | null;

  @Column()
  action!: "INSERT" | "UPDATE" | "DELETE";

  @Column()
  entityName!: string;

  @Column({ type: "uuid", nullable: true })
  entityId!: string | null;

  @Column({ type: "jsonb", nullable: true })
  before!: Record<string, any> | null;

  @Column({ type: "jsonb", nullable: true })
  after!: Record<string, any> | null;

  @Column({ type: "jsonb", nullable: true })
  diff!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
