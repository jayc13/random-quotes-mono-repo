import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accessControlMiddleware } from "@/middlewares/accessControl.middleware";
import { validateApiToken } from "@/services/api-token.service";

vi.mock("@/services/api-token.service", () => ({
  validateApiToken: vi.fn(),
}));

describe("accessControlMiddleware", () => {
  let request: Request;
  let env: any;
  let ctx: any;

  beforeEach(() => {
    vi.resetAllMocks();
    request = {
      url: 'http://example.com',
      headers: new Headers()
    } as Request;
    env = { DB: {}, ALLOWED_ORIGINS: "" };
    ctx = { props: {} };
  });

  it("should initialize ctx.props if undefined", async () => {
    ctx = {}; // No props
    await accessControlMiddleware(request, env, ctx);

    expect(ctx.props).toBeDefined();
    expect(ctx.props.accessGranted).toBe(false);
    expect(ctx.props.originAllowed).toBe(true);
  });

  describe("Origin checks", () => {
    it("should mark origin as allowed if it matches ALLOWED_ORIGINS", async () => {
      env.ALLOWED_ORIGINS = "http://allowed.com";
      request.headers.set("Origin", "http://allowed.com");

      await accessControlMiddleware(request, env, ctx);

      expect(ctx.props.originAllowed).toBe(true);
      // Access is not granted just because origin is allowed
      expect(ctx.props.accessGranted).toBe(false);
    });

    it("should mark origin as not allowed if it doesn't match ALLOWED_ORIGINS", async () => {
      env.ALLOWED_ORIGINS = "http://allowed.com";
      request.headers.set("Origin", "http://other.com");

      await accessControlMiddleware(request, env, ctx);

      expect(ctx.props.originAllowed).toBe(false);
      expect(ctx.props.accessGranted).toBe(false);
    });
  });

  describe("API Token checks", () => {
    beforeEach(() => env.ALLOWED_ORIGINS = "");

    it("should grant access for valid token", async () => {
      request.headers.set("api-token", "valid");
      vi.mocked(validateApiToken).mockResolvedValue(true);

      await accessControlMiddleware(request, env, ctx);

      expect(ctx.props.accessGranted).toBe(true);
      expect(ctx.props.authMethod).toBe("apitoken");
      expect(ctx.props.user).toEqual({
        name: "API Token User",
        sub: "api-token-user",
        roles: ["ApiUser"]
      });
    });

    it("should not grant access for invalid token", async () => {
      request.headers.set("api-token", "invalid");
      vi.mocked(validateApiToken).mockResolvedValue(false);

      await accessControlMiddleware(request, env, ctx);

      expect(ctx.props.accessGranted).toBe(false);
      expect(ctx.props.authMethod).toBeUndefined();
    });

    it("should not grant access when no token is provided", async () => {
      await accessControlMiddleware(request, env, ctx);

      expect(validateApiToken).not.toHaveBeenCalled();
      expect(ctx.props.accessGranted).toBe(false);
      expect(ctx.props.authMethod).toBeUndefined();
    });

    it("should handle validation errors", async () => {
      request.headers.set("api-token", "error");
      vi.mocked(validateApiToken).mockRejectedValue(new Error("Token validation error"));

      await accessControlMiddleware(request, env, ctx);

      expect(ctx.props.accessGranted).toBe(false);
    });
  });

  it("should process API token even if Origin is provided", async () => {
    env.ALLOWED_ORIGINS = "http://allowed.com";
    request.headers.set("Origin", "http://allowed.com");
    request.headers.set("api-token", "valid");
    vi.mocked(validateApiToken).mockResolvedValue(true);

    await accessControlMiddleware(request, env, ctx);

    expect(ctx.props.originAllowed).toBe(true);
    expect(ctx.props.accessGranted).toBe(true);
    expect(ctx.props.authMethod).toBe("apitoken");
    expect(validateApiToken).toHaveBeenCalled();
  });
});