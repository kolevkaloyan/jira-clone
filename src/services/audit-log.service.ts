import { AppDataSource } from "../data-source";
import { GetAuditLogsQuery } from "../dtos/audit-log.dto";
import { AuditLog } from "../entities/AuditLog";

export class AuditLogService {
  private static auditRepo = AppDataSource.getRepository(AuditLog);

  static async getLogs(filters: GetAuditLogsQuery) {
    const { entityName, entityId, userId, action, limit, page } = filters;

    const skip = (page - 1) * limit;

    const query = this.auditRepo
      .createQueryBuilder("audit")
      .orderBy("audit.createdAt", "DESC")
      .take(limit)
      .skip(skip);

    if (entityName)
      query.andWhere("audit.entityName = :entityName", { entityName });
    if (entityId) query.andWhere("audit.entityId = :entityId", { entityId });
    if (userId) query.andWhere("audit.userId = :userId", { userId });
    if (action) query.andWhere("audit.action = :action", { action });

    const [logs, total] = await query.getManyAndCount();

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }
}
