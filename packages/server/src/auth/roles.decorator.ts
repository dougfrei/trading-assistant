import { Reflector } from '@nestjs/core';
import EUserRoleType from 'src/enums/EUserRoleType';

export const Roles = Reflector.createDecorator<EUserRoleType[]>();
