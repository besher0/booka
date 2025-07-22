/* eslint-disable prettier/prettier */
import { SetMetadata } from "@nestjs/common";
import { UserType } from "../../utils/enum/enums";

// Roles Method Decorator
export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);