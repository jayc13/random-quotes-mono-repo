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
    request = { headers: new Headers() } as Request;
    env = { DB: {}, ALLOWED_ORIGINS: "" };
    ctx = { props: {} };
  });

  it("should initialize ctx.props if undefined", async () => {
    await expect(accessControlMiddleware(request, env, {}))
      .rejects.toThrow("No API-Token provided.");
  });

  describe("Origin checks", () => {
    it("should grant access for allowed origin", async () => {
      env.ALLOWED_ORIGINS = "http://allowed.com";
      request.headers.set("Origin", "http://allowed.com");

      await accessControlMiddleware(request, env, ctx);

      expect(ctx.props.accessGranted).toBe(true);
      expect(ctx.props.authMethod).toBe("origin");
    });

    it("should not grant access for disallowed origin", async () => {
      env.ALLOWED_ORIGINS = "http://allowed.com";
      request.headers.set("Origin", "http://other.com");

      await expect(accessControlMiddleware(request, env, ctx))
        .rejects.toThrow("No API-Token provided.");
    });
  });

  describe("API Token checks", () => {
    beforeEach(() => env.ALLOWED_ORIGINS = "");

    it("should grant access for valid token", async () => {
      request.headers.set("API-Token", "valid");
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
      request.headers.set("API-Token", "invalid");
      vi.mocked(validateApiToken).mockResolvedValue(false);

      await expect(accessControlMiddleware(request, env, ctx))
        .rejects.toThrow("Invalid API Token.");
    });

    it("should handle validation errors", async () => {
      request.headers.set("API-Token", "error");
      vi.mocked(validateApiToken).mockRejectedValue(new Error());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(accessControlMiddleware(request, env, ctx))
        .rejects.toThrow();

      expect(ctx.props.accessGranted).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  it("should prioritize origin over token", async () => {
    env.ALLOWED_ORIGINS = "http://allowed.com";
    request.headers.set("Origin", "http://allowed.com");
    request.headers.set("API-Token", "valid");

    await accessControlMiddleware(request, env, ctx);

    expect(ctx.props.authMethod).toBe("origin");
    expect(validateApiToken).not.toHaveBeenCalled();
  });
});