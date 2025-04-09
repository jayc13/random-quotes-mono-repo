import worker from './index'; // Import the worker

// Mock D1 Database
const mockD1Database = {
  prepare: (query: string) => ({
    bind: (...params: any[]) => ({
      run: async () => ({ results: [], changes: 1, lastRowId: 1 }), // Default mock result with changes and lastRowId
      all: async () => ({ results: [] }), // Default mock result
    }),
    first: async () => ({})
  }),
  exec: async (query: string) => {},
};

// Mock jwtVerify
const mockJwtVerify = async (token: string, secret: any, options: any) => {
  if (token === "valid_token") {
    return { payload: { [`http://localhost/roles`]: ['admin'] } }; // Simulate valid token with admin role
  } else if (token === "valid_user_token") {
    return { payload: { sub: "user123" } }; // Simulate valid token with a user
  } else {
    throw new Error("Invalid token");
  }
};

//Override original functions with mocks
(globalThis as any).jwtVerify = mockJwtVerify;

const { fetch, setup, verifyAuth, isAdmin } = worker;

// Test setup function (basic check)
async function testSetup() {
  try {
    await setup({ DB: mockD1Database });
    console.log("testSetup: Test passed");
  } catch (error) {
    console.error("testSetup: Test failed", error);
  }
}

// Test isAdmin function
function testIsAdmin() {
  const adminPayload = { admin: true };
  const nonAdminPayload = {};
  if (isAdmin(adminPayload, "admin") && !isAdmin(nonAdminPayload, "admin")) {
    console.log("testIsAdmin: Test passed");
  } else {
    console.error("testIsAdmin: Test failed");
  }
}

// Basic test for fetch
async function testFetchBasic() {
  try {
    const request = new Request("http://localhost/quotes", { method: "GET" });
    const response = await fetch(request, { DB: mockD1Database } as any); // Provide mock DB
    // Assuming GET /quotes returns an array of quotes, check for status 200 and an array
    if (response.status === 200) {
      const body = await response.json();
      if (Array.isArray(body)) {
        console.log("testFetchBasic: Test passed");
      } else {
        console.error("testFetchBasic: Test failed - Expected an array, got:", body);
      }
    } else {
      console.error("testFetchBasic: Test failed - Unexpected status", response.status);
    }
  } catch (error) {
    console.error("testFetchBasic: Test failed", error);
  }
}

//Test verifyAuth
async function testVerifyAuth() {
    const mockEnv = {
        AUTH0_DOMAIN: "test-domain",
        AUTH0_AUDIENCE: "test-audience",
        AUTH0_ADMIN_ROLE: "admin"
    };

    // Valid token with admin
    let passed = true;
    try {
        const req = new Request("http://localhost", { headers: { "Authorization": "Bearer valid_token" } });
        await verifyAuth(req, mockEnv as any, true);
    } catch (e) {
        console.error("testVerifyAuth (valid admin): Test failed", e);
        passed = false;
    }
    if (passed) console.log("testVerifyAuth (valid admin): Test passed");

    // Valid token without admin - should fail if admin required
    passed = false;
    try {
        const req = new Request("http://localhost", { headers: { "Authorization": "Bearer valid_user_token" } });
        await verifyAuth(req, mockEnv as any, true);
        console.error("testVerifyAuth (valid user, admin required): Test failed - should have thrown error");
    } catch (e: any) {
        if (e.status === 403) {
            passed = true;
        } else {
            console.error("testVerifyAuth (valid user, admin required): Test failed - wrong error", e);
        }
    }
    if (passed) console.log("testVerifyAuth (valid user, admin required): Test passed");

    // Valid token without admin - should pass if admin not required
    passed = true;
    try {
        const req = new Request("http://localhost", { headers: { "Authorization": "Bearer valid_user_token" } });
        await verifyAuth(req, mockEnv as any, false);
    } catch (e) {
        console.error("testVerifyAuth (valid user, no admin required): Test failed", e);
        passed = false;
    }
    if (passed) console.log("testVerifyAuth (valid user, no admin required): Test passed");

    // Invalid token
    passed = false;
    try {
        const req = new Request("http://localhost", { headers: { "Authorization": "Bearer invalid_token" } });
        await verifyAuth(req, mockEnv as any, false);
        console.error("testVerifyAuth (invalid token): Test failed - should have thrown error");

    } catch (e: any) {
        if (e.status === 401) {
            passed = true;
        } else {
            console.error("testVerifyAuth (invalid token): Test failed - wrong error", e);
        }
    }
    if (passed) console.log("testVerifyAuth (invalid token): Test passed");

    //Missing token
    passed = false;
    try {
        const req = new Request("http://localhost", { headers: { "Authorization": "Bearer " } });
        await verifyAuth(req, mockEnv as any, false);
        console.error("testVerifyAuth (missing token): Test failed - should have thrown error");
    } catch (e: any) {
        if (e.status === 401) {
            passed = true;
        } else {
            console.error("testVerifyAuth (missing token): Test failed - wrong error", e);
        }
    }
    if (passed) console.log("testVerifyAuth (missing token): Test passed");

    // Missing header
    passed = false;
    try {
        const req = new Request("http://localhost");
        await verifyAuth(req, mockEnv as any, false);
        console.error("testVerifyAuth (missing header): Test failed - should have thrown error");
    } catch (e: any) {
        if (e.status === 401) {
            passed = true;
        } else {
            console.error("testVerifyAuth (missing header): Test failed - wrong error", e);
        }
    }
    if (passed) console.log("testVerifyAuth (missing header): Test passed");
}

async function testFetchPostQuotes() {
  let passed = true;
  const mockEnv = {
    DB: mockD1Database,
    AUTH0_DOMAIN: "test-domain",
    AUTH0_AUDIENCE: "test-audience",
    AUTH0_ADMIN_ROLE: "http://localhost/roles"
  } as any;

  // Admin user should succeed
  try {
    const req = new Request("http://localhost/quotes", {
      method: "POST",
      headers: { "Authorization": "Bearer valid_token", "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Quote" })
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 201) throw new Error(`Unexpected status: ${res.status}`);
    const body = await res.json();
    // The mock DB returns lastRowId 1, so we expect that
    if (body.id !== 1 || body.name !== "Test Quote") throw new Error(`Unexpected response: ${JSON.stringify(body)}`);
  } catch (e) {
    console.error("testFetchPostQuotes (admin): Test failed", e);
    passed = false;
  }
  if (passed) console.log("testFetchPostQuotes (admin): Test passed");

  // Non-admin should fail
  passed = false;
  try {
    const req = new Request("http://localhost/quotes", {
      method: "POST",
      headers: { "Authorization": "Bearer valid_user_token", "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Quote" })
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 403) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 403") {
      console.error("testFetchPostQuotes (non-admin): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchPostQuotes (non-admin): Test passed");

  // Unauthenticated should fail
  passed = false;
  try {
    const req = new Request("http://localhost/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Quote" })
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 401) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 401") {
      console.error("testFetchPostQuotes (unauthenticated): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchPostQuotes (unauthenticated): Test passed");
}

// Run the tests
testSetup();
testIsAdmin();
testFetchBasic();
testVerifyAuth();
testFetchPostQuotes();
async function testFetchGetQuoteById() {
  let passed = true;
  const mockEnv = { DB: mockD1Database } as any;

  // Successful retrieval
  try {
    // Mock the database to return a quote
    const mockDBWithResult = {
      prepare: (query: string) => ({
        bind: (...params: any[]) => ({
          all: async () => ({ results: [{ id: 1, name: "Test Quote" }] }),
        }),
      }),
    };
    const req = new Request("http://localhost/quotes/1", { method: "GET" });
    const res = await fetch(req, { ...mockEnv, DB: mockDBWithResult });
    if (res.status !== 200) throw new Error(`Unexpected status: ${res.status}`);
    const body = await res.json();
    if (body.id !== 1 || body.name !== "Test Quote") throw new Error(`Unexpected response: ${JSON.stringify(body)}`);
  } catch (e) {
    console.error("testFetchGetQuoteById (success): Test failed", e);
    passed = false;
  }
  if (passed) console.log("testFetchGetQuoteById (success): Test passed");

  // Quote not found
  passed = false;
  try {
    const req = new Request("http://localhost/quotes/999", { method: "GET" });
    const res = await fetch(req, mockEnv); // Use the original mock DB (no results)
    if (res.status !== 404) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 404") {
      console.error("testFetchGetQuoteById (not found): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchGetQuoteById (not found): Test passed");
}

async function testFetchPutQuote() {
  let passed = true;
  const mockEnv = {
    DB: mockD1Database,
    AUTH0_DOMAIN: "test-domain",
    AUTH0_AUDIENCE: "test-audience",
    AUTH0_ADMIN_ROLE: "admin"
  } as any;

  // Admin user should succeed
  try {
    // Mock the database to return a successful update
    const mockDBWithResult = {
      prepare: (query: string) => ({
        bind: (...params: any[]) => ({
          run: async () => ({ results: [], changes: 1 }), // Simulate successful update
        }),
      }),
    };
    const req = new Request("http://localhost/quotes/1", {
      method: "PUT",
      headers: { "Authorization": "Bearer valid_token", "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Quote" })
    });
    const res = await fetch(req, { ...mockEnv, DB: mockDBWithResult });
    if (res.status !== 200) throw new Error(`Unexpected status: ${res.status}`);
    const body = await res.json();
    if (body.id !== "1" || body.name !== "Updated Quote") throw new Error(`Unexpected response: ${JSON.stringify(body)}`);
  } catch (e) {
    console.error("testFetchPutQuote (admin): Test failed", e);
    passed = false;
  }
  if (passed) console.log("testFetchPutQuote (admin): Test passed");

  // Non-admin should fail
  passed = false;
  try {
    const req = new Request("http://localhost/quotes/1", {
      method: "PUT",
      headers: { "Authorization": "Bearer valid_user_token", "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Quote" })
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 403) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 403") {
      console.error("testFetchPutQuote (non-admin): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchPutQuote (non-admin): Test passed");

  // Unauthenticated should fail
  passed = false;
  try {
    const req = new Request("http://localhost/quotes/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Quote" })
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 401) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 401") {
      console.error("testFetchPutQuote (unauthenticated): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchPutQuote (unauthenticated): Test passed");
}

async function testFetchDeleteQuote() {
  let passed = true;
  const mockEnv = {
    DB: mockD1Database,
    AUTH0_DOMAIN: "test-domain",
    AUTH0_AUDIENCE: "test-audience",
    AUTH0_ADMIN_ROLE: "admin"
  } as any;

  // Admin user should succeed
  try {
    // Mock the database to return a successful deletion
    const mockDBWithResult = {
      prepare: (query: string) => ({
        bind: (...params: any[]) => ({
          run: async () => ({ results: [], changes: 1 }), // Simulate successful deletion
        }),
      }),
    };
    const req = new Request("http://localhost/quotes/1", {
      method: "DELETE",
      headers: { "Authorization": "Bearer valid_token" },
    });
    const res = await fetch(req, { ...mockEnv, DB: mockDBWithResult });
    if (res.status !== 204) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e) {
    console.error("testFetchDeleteQuote (admin): Test failed", e);
    passed = false;
  }
  if (passed) console.log("testFetchDeleteQuote (admin): Test passed");

  // Non-admin should fail
  passed = false;
  try {
    const req = new Request("http://localhost/quotes/1", {
      method: "DELETE",
      headers: { "Authorization": "Bearer valid_user_token" },
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 403) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 403") {
      console.error("testFetchDeleteQuote (non-admin): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchDeleteQuote (non-admin): Test passed");

  // Unauthenticated should fail
  passed = false;
  try {
    const req = new Request("http://localhost/quotes/1", {
      method: "DELETE",
    });
    const res = await fetch(req, mockEnv);
    if (res.status !== 401) throw new Error(`Unexpected status: ${res.status}`);
  } catch (e: any) {
    if (e.message !== "Unexpected status: 401") {
      console.error("testFetchDeleteQuote (unauthenticated): Test failed - wrong error", e);
    }
  }
  if (passed) console.log("testFetchDeleteQuote (unauthenticated): Test passed");
}

// Run the tests
testSetup();
testIsAdmin();
testFetchBasic();
testVerifyAuth();
testFetchPostQuotes();
testFetchGetQuoteById();
testFetchPutQuote();
testFetchDeleteQuote();
