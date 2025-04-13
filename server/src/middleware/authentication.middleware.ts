import {parseJwt} from "@cfworker/jwt";

export interface User {
	given_name: string,
	family_name: string,
	nickname: string,
	name: string,
	picture: string,
	updated_at: string,
	email: string,
	email_verified: boolean,
	iss: string,
	aud: string,
	sub: string,
	iat: number,
	exp: number,
	sid: string,
	nonce: string,
	roles: string[]
}

export async function isAdmin(ctx: ExecutionContext) {
	return ctx.props.user?.roles?.includes('Admin') ?? false;
}

export async function authenticationMiddleware(request: Request, env: Env, ctx: ExecutionContext) {
	const token = request.headers.get('authorization')?.split(' ')?.[1];

	if (!token) {
		throw new Error('Token not found');
	}

	const result: any = await parseJwt({
		jwt: token,
		issuer: env.AUTH0_DOMAIN,
		audience: env.AUTH0_CLIENT_ID,
	});

	if (!result.valid) {
		throw new Error('Invalid token');
	} else {

		let roles: string[] = [];
		if (Object.keys(result.payload).includes('random_quotes/roles')) {
			roles = result.payload['random_quotes/roles'] as string[];
			delete result.payload['random_quotes/roles'];
		}

		const user: User = {
			...result.payload,
			roles,
		};

		ctx.props.user = user as User;
	}
}
