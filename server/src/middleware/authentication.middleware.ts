import {parseJwt} from "@cfworker/jwt";

export default async function authenticationMiddleware(request: Request, env: Env, ctx: ExecutionContext) {

	const token = request.headers.get('Authorization')?.split(' ')?.[1];

	if (!token) {
		return Response.json('Unauthorized', {status: 401});
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
