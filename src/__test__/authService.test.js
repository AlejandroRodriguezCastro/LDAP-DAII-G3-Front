import { authService } from "../services/authService";
import { userService } from "../services/userService";

// Mocks globales necesarios
global.fetch = jest.fn();
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; }
};

// Mock jwtDecode
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({ email: "user@test.com" }))
}));

// Mock userService
jest.mock("../services/userService", () => ({
  userService: {
    getUser: jest.fn(() => Promise.resolve({ roles: [] }))
  }
}));

describe("authService basic coverage tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.store = {};
  });

  // LOGIN ---------------------------------------------------------
  it("login should return success true", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve("fakeToken")
    });

    const res = await authService.login({ email: "a", password: "b" });

    expect(res.success).toBe(true);
    expect(fetch).toHaveBeenCalled();
  });

  it("login should throw error when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("fail"));
    await expect(authService.login({ email: "a", password: "b" }))
      .rejects.toThrow();
  });

  // VALIDATE TOKEN -------------------------------------------------
  it("validateToken should return success true when OK", async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const res = await authService.validateToken("abc");
    expect(res.success).toBe(true);
  });

  it("validateToken should return success false when response not ok", async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    const res = await authService.validateToken("abc");
    expect(res.success).toBe(false);
  });

  // REGISTER -------------------------------------------------------
  it("register should return success true", async () => {
    const res = await authService.register({
      email: "nuevo@test.com",
      password: "123",
      name: "Test"
    });
    expect(res.success).toBe(true);
  });

  it("register should throw when email already exists", async () => {
    await expect(
      authService.register({
        email: "test@citypass.com",
        password: "123",
        name: "Test"
      })
    ).rejects.toThrow();
  });

  // RECOVER PASSWORD -----------------------------------------------
  it("recoverPassword should return success true", async () => {
    const res = await authService.recoverPassword("a@test.com");
    expect(res.success).toBe(true);
  });

  // LOGOUT ---------------------------------------------------------
  it("logout should remove authToken and user", () => {
    localStorage.setItem("authToken", "123");
    localStorage.setItem("user", "{}");

    authService.logout();

    expect(localStorage.getItem("authToken")).toBe(null);
    expect(localStorage.getItem("user")).toBe(null);
  });

  // GETTOKEN -------------------------------------------------------
  it("getToken should return stored token", () => {
    localStorage.setItem("authToken", "abc");
    expect(authService.getToken()).toBe("abc");
  });

  // GETUSER --------------------------------------------------------
  it("getUser should return parsed user", () => {
    localStorage.setItem("user", JSON.stringify({ name: "Juan" }));
    const user = authService.getUser();
    expect(user.name).toBe("Juan");
  });

});
