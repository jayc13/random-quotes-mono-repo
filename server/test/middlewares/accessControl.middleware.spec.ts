import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accessControlMiddleware } from "@/middlewares/accessControl.middleware";
import { validateApiToken } from "@/services/api-token.service";

// Mock services
vi.mock("@/services/api-token.service", () => ({
  validateApiToken: vi.fn(),
}));

const mockValidateApiToken = validateApiToken as vi.MockedFunction<typeof validateApiToken>;

describe("accessControlMiddleware", () => {
  let mockRequest: Request;
  let mockEnv: any;
  let mockCtx: any;
  let mockNext: vi.Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    mockRequest = {
      headers: new Headers(),
      url: "http://localhost/test",
      method: "GET",
    } as Request;

    mockEnv = {
      DB: { prepare: vi.fn().mockReturnThis(), bind: vi.fn().mockReturnThis(), first: vi.fn() }, // Basic D1 mock
      ALLOWED_ORIGINS: "",
    };

    mockCtx = {
      props: {}, // Initialize props
    };

    mockNext = vi.fn(async () => Promise.resolve(new Response("Next called")));
  });

  describe("Initialization", () => {
    it("should initialize ctx.props if it's undefined", async () => {
      const emptyCtx: any = {}; // No props object
      await accessControlMiddleware(mockRequest, mockEnv, emptyCtx, mockNext);
      expect(emptyCtx.props).toBeDefined();
      expect(emptyCtx.props.accessGranted).toBe(false);
    });
  });

  describe("Origin Allowlist", () => {
    it("should grant access if origin is in ALLOWED_ORIGINS", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://allowed.com,http://another.com";
      mockRequest.headers.set("Origin", "http://allowed.com");

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockCtx.props.accessGranted).toBe(true);
      expect(mockCtx.props.authMethod).toBe("origin");
      expect(mockValidateApiToken).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should grant access if origin is in ALLOWED_ORIGINS (case-insensitive)", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://Allowed.com";
      mockRequest.headers.set("Origin", "http://allowed.com");
      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);
      expect(mockCtx.props.accessGranted).toBe(true);
      expect(mockCtx.props.authMethod).toBe("origin");
    });
    
    it("should not grant access if origin is not in ALLOWED_ORIGINS", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://allowed.com";
      mockRequest.headers.set("Origin", "http://disallowed.com");

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockCtx.props.authMethod).toBeUndefined(); // Or whatever the default is
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should not grant access if no Origin header and ALLOWED_ORIGINS is set", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://allowed.com";
      // No Origin header

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should not grant access if ALLOWED_ORIGINS is not set", async () => {
      // ALLOWED_ORIGINS is empty by default
      mockRequest.headers.set("Origin", "http://any.com");

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe("API Token Authentication", () => {
    beforeEach(() => {
      // Ensure origin check is bypassed or fails for these tests
      mockEnv.ALLOWED_ORIGINS = ""; 
    });

    it("should grant access and set API user if API-Token is valid", async () => {
      mockRequest.headers.set("API-Token", "valid-token");
      mockValidateApiToken.mockResolvedValue(true);

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockValidateApiToken).toHaveBeenCalledWith(mockEnv.DB, "valid-token");
      expect(mockCtx.props.accessGranted).toBe(true);
      expect(mockCtx.props.authMethod).toBe("apitoken");
      expect(mockCtx.props.user).toEqual({
        name: "API Token User",
        sub: "api-token-user",
        roles: ["ApiUser"],
      });
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should not grant access if API-Token is invalid", async () => {
      mockRequest.headers.set("API-Token", "invalid-token");
      mockValidateApiToken.mockResolvedValue(false);

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockValidateApiToken).toHaveBeenCalledWith(mockEnv.DB, "invalid-token");
      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should not grant access if API-Token validation throws an error", async () => {
      mockRequest.headers.set("API-Token", "error-token");
      const validationError = new Error("DB connection failed");
      mockValidateApiToken.mockRejectedValue(validationError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockValidateApiToken).toHaveBeenCalledWith(mockEnv.DB, "error-token");
      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error during API Token validation:", validationError);
      
      consoleErrorSpy.mockRestore();
    });

    it("should not grant access if no API-Token header", async () => {
      // No API-Token header
      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockValidateApiToken).not.toHaveBeenCalled();
      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe("Order of Operations", () => {
    it("should prioritize allowed origin over API token", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://trusted.com";
      mockRequest.headers.set("Origin", "http://trusted.com");
      mockRequest.headers.set("API-Token", "valid-token");
      mockValidateApiToken.mockResolvedValue(true); // Should not be called

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockCtx.props.accessGranted).toBe(true);
      expect(mockCtx.props.authMethod).toBe("origin");
      expect(mockValidateApiToken).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should use API token if origin is disallowed and API token is valid", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://trusted.com"; // Set some allowed origins
      mockRequest.headers.set("Origin", "http://untrusted.com"); // Different origin
      mockRequest.headers.set("API-Token", "good-token");
      mockValidateApiToken.mockResolvedValue(true);

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);

      expect(mockValidateApiToken).toHaveBeenCalledWith(mockEnv.DB, "good-token");
      expect(mockCtx.props.accessGranted).toBe(true);
      expect(mockCtx.props.authMethod).toBe("apitoken");
      expect(mockCtx.props.user).toBeDefined();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("should not grant access if origin disallowed and API token invalid", async () => {
      mockEnv.ALLOWED_ORIGINS = "http://trusted.com";
      mockRequest.headers.set("Origin", "http://untrusted.com");
      mockRequest.headers.set("API-Token", "bad-token");
      mockValidateApiToken.mockResolvedValue(false);

      await accessControlMiddleware(mockRequest, mockEnv, mockCtx, mockNext);
      
      expect(mockValidateApiToken).toHaveBeenCalledWith(mockEnv.DB, "bad-token");
      expect(mockCtx.props.accessGranted).toBe(false);
      expect(mockCtx.props.authMethod).toBeUndefined();
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });
});
