import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AdminRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Must run after AdminJwtGuard (relies on request.admin being populated).
 * If a route has no @Roles() metadata, any authenticated admin may access it.
 */
@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin as { role: AdminRole } | undefined;
    return !!admin && requiredRoles.includes(admin.role);
  }
}
