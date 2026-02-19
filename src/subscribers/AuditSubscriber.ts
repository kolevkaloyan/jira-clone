import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent
} from "typeorm";
import { AuditLog } from "../entities/AuditLog";
import { computeDiff } from "../utils/diff.util";
import { getRequestContext } from "../utils/requestContext";

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  listenTo() {
    return Object;
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.tableName === "audit_logs") return;

    const context = getRequestContext();

    await event.manager.insert(AuditLog, {
      userId: context?.userId,
      action: "INSERT",
      entityName: event.metadata.name,
      entityId: event.entity?.id?.toString(),
      after: event.entity
    });
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.tableName === "audit_logs") return;

    if (!event.databaseEntity || !event.entity) return;

    const context = getRequestContext();
    const diff = computeDiff(event.databaseEntity, event.entity);

    await event.manager.insert(AuditLog, {
      userId: context?.userId,
      action: "UPDATE",
      entityName: event.metadata.name,
      entityId: event.entity?.id?.toString(),
      before: event.databaseEntity,
      after: event.entity,
      diff
    });
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.tableName === "audit_logs") return;

    const context = getRequestContext();

    await event.manager.insert(AuditLog, {
      userId: context?.userId,
      action: "DELETE",
      entityName: event.metadata.name,
      entityId: event.entityId?.toString(),
      before: event.databaseEntity
    });
  }
}
