import { roleEnum } from "../users.entity";

export type RoleType = (typeof roleEnum.enumValues)[number];
