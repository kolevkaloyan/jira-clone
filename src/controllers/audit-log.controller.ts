import { Request, Response } from "express";
import { AuditLogService } from "../services/audit-log.service";
import { catchAsync } from "../utils/catchAsync";
import { getAuditLogsSchema } from "../dtos/audit-log.dto";

export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const { query } = getAuditLogsSchema.parse(req);

  const results = await AuditLogService.getLogs(query);

  res.status(200).json({
    status: "success",
    data: results
  });
});
