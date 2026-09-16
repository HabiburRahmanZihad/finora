import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/** Restricts a route/controller to users whose JWT `role` claim is one of these. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
