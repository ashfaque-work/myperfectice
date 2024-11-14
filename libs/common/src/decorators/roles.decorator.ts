import { SetMetadata } from '@nestjs/common';
export const Roles = (roles: string[]) => SetMetadata('roles', roles);

// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { User } from '../database/models/user.schema';

// const getCurrentUserByContext = (data: string[], context: ExecutionContext) => {
//   const request = context.switchToHttp().getRequest();
//   return data || request.body?.user?.roles || [];
// };

// export const Roles = createParamDecorator(
//   (data: string[], context: ExecutionContext) =>
//     getCurrentUserByContext(data, context),
// );
