import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AdminRole } from "@prisma/client";

export interface RequestAdmin {
  id: string;
  role: AdminRole;
  name: string;
}

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestAdmin => {
  const request = ctx.switchToHttp().getRequest();
  return request.admin;
});
