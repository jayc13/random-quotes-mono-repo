import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticationMiddleware } from "@/middlewares/authentication.middleware";
import { parseJwt } from "@cfworker/jwt";

// Mock @cfworker/jwt
vi.mock("@cfworker/jwt", () => ({
  parseJwt: vi.fn(),
}));

const mockParseJwt = parseJwt as vi.MockedFunction<typeof parseJwt>;

describe("authenticationMiddleware (JWT Focus)", () => {
  let mockRequest: Request;
  let mockEnv: any;
  let mockCtx: any;

  const sampleJwtPayload = {
    iss: "https://test.auth0.com/",
    sub: "auth0|user123",
    aud: "test-client-id",
    iat: Math.floor(Date.now() / 1000) - 3600,
    exp: Math.floor(Date.now() / 1000) + 3600,
    azp: "test-client-id",
    scope: "openid profile email",
    given_name: "Test",
    family_name: "User",
    nickname: "testuser",
    name: "Test User",
    picture: "https://example.com/testuser.jpg",
    locale: "en",
    email: "testuser@example.com",
    email_verified: true,
    updated_at: new Date().toISOString(),
    sid: "test-session-id",
    nonce: "test-nonce",
    "random_quotes/roles": ["Admin", "User"],
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockRequest = {
      headers: new Headers(),
      url: "http://localhost/protected-route",
      method: "GET",
    } as Request;

    mockEnv = {
      AUTH0_DOMAIN: "test.auth0.com",
      AUTH0_CLIENT_ID: "test-client-id",
    };

    mockCtx = {
      props: {},
    };
  });

  it("should successfully authenticate a valid JWT and set user context", async () => {
    mockRequest.headers.set("Authorization", "Bearer valid-jwt-token");
    mockParseJwt.mockResolvedValue({ valid: true, payload: { ...sampleJwtPayload } });

    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockParseJwt).toHaveBeenCalledWith({
      jwt: "valid-jwt-token",
      issuer: `https://${mockEnv.AUTH0_DOMAIN}/`,
      audience: mockEnv.AUTH0_CLIENT_ID,
    });
    expect(mockCtx.props.user).toBeDefined();
    expect(mockCtx.props.user.sub).toBe("auth0|user123");
    expect(mockCtx.props.user.name).toBe("Test User");
    expect(mockCtx.props.user.email).toBe("testuser@example.com");
    expect(mockCtx.props.user.roles).toEqual(["Admin", "User"]);
    expect(mockCtx.props.accessGranted).toBe(true);
  });

  it("should correctly handle JWT payload without custom roles", async () => {
    mockRequest.headers.set("Authorization", "Bearer valid-jwt-no-roles");
    const payloadWithoutRoles = { ...sampleJwtPayload };
    delete payloadWithoutRoles["random_quotes/roles"];
    mockParseJwt.mockResolvedValue({ valid: true, payload: payloadWithoutRoles });

    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockCtx.props.user).toBeDefined();
    expect(mockCtx.props.user.roles).toEqual([]);
    expect(mockCtx.props.accessGranted).toBe(true);
  });

  it("should not set user context if parseJwt returns not valid", async () => {
    mockRequest.headers.set("Authorization", "Bearer invalid-jwt-token");
    mockParseJwt.mockResolvedValue({ valid: false, payload: {} });

    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockParseJwt).toHaveBeenCalledWith({
      jwt: "invalid-jwt-token",
      issuer: `https://${mockEnv.AUTH0_DOMAIN}/`,
      audience: mockEnv.AUTH0_CLIENT_ID,
    });
    expect(mockCtx.props.user).toBeUndefined();
    expect(mockCtx.props.accessGranted).toBeUndefined();
  });

  it("should not set user context if Authorization header is missing", async () => {
    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockParseJwt).not.toHaveBeenCalled();
    expect(mockCtx.props.user).toBeUndefined();
    expect(mockCtx.props.accessGranted).toBeUndefined();
  });

  it("should not set user context if Authorization header is not a Bearer token", async () => {
    mockRequest.headers.set("Authorization", "Basic someotherformoftoken");
    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockParseJwt).not.toHaveBeenCalled();
    expect(mockCtx.props.user).toBeUndefined();
    expect(mockCtx.props.accessGranted).toBeUndefined();
  });

  it("should not set user context if Authorization header Bearer part is empty", async () => {
    mockRequest.headers.set("Authorization", "Bearer "); // Empty token
    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockParseJwt).not.toHaveBeenCalled();
    expect(mockCtx.props.user).toBeUndefined();
    expect(mockCtx.props.accessGranted).toBeUndefined();
  });

  it("should correctly pass issuer and audience to parseJwt", async () => {
    mockRequest.headers.set("Authorization", "Bearer another-valid-token");
    mockEnv.AUTH0_DOMAIN = "custom.domain.com";
    mockEnv.AUTH0_CLIENT_ID = "custom-client-id";
    mockParseJwt.mockResolvedValue({ valid: true, payload: { ...sampleJwtPayload } });

    await authenticationMiddleware(mockRequest, mockEnv, mockCtx);

    expect(mockParseJwt).toHaveBeenCalledWith({
      jwt: "another-valid-token",
      issuer: "https://custom.domain.com/",
      audience: "custom-client-id",
    });
    expect(mockCtx.props.accessGranted).toBe(true);
  });
});