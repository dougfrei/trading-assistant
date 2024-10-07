import { SetMetadata } from '@nestjs/common';

export const SkipAuthCheck = () => SetMetadata('skipAuthCheck', true);
