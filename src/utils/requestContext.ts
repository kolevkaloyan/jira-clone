import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
  userId?: string;
  requestId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = () => requestContext.getStore();
