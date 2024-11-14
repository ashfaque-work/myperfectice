// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    console.log(`role guard has been called`);
    const request = context.switchToHttp().getRequest();
    const userRoles = request.body?.roles;
    if (!requiredRoles) {
      return true; // No roles are specified, allow access
    }

    if (!userRoles || !this.hasRequiredRoles(userRoles, requiredRoles)) {
      return false;
    }

    return true;
  }

  private hasRequiredRoles(
    userRoles: string[],
    requiredRoles: string[],
  ): boolean {
    // return requiredRoles.every((role) => userRoles.includes(role));
    // Check if the user has at least one of the required roles
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
