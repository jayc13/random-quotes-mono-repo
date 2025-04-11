import {parseJwt} from "@cfworker/jwt";

export default async function authenticationMiddleware(request: Request, env: Env, ctx: ExecutionContext) {
	const token = request.headers.get('authorization')?.split(' ')?.[1];

	if (!token) {
		throw new Error('Token not found');
	}

	const result = await parseJwt({
		jwt: token,
		issuer: env.AUTH0_DOMAIN,
		audience: env.AUTH0_CLIENT_ID,
	});

	if (!result.valid) {
		throw new Error('Invalid token');
	} else {
		ctx.props.user = result.payload;
	}
}
