import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/entities/User.model';

export const CurrentUser = createParamDecorator<User | null>(
	(data: unknown, ctx: ExecutionContext) => {
		if (ctx.getType<GqlContextType>() === 'graphql') {
			const gqlCtx = GqlExecutionContext.create(ctx).getContext();

			return gqlCtx?.user instanceof User ? gqlCtx.user : null;
		} else {
			const req = ctx.switchToHttp().getRequest();

			return req?.user instanceof User ? req.user : null;
		}
	}
);
