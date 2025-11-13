// services/__tests__/organizationService.test.js
import { organizationService } from "../services/organizationService";

global.fetch = jest.fn();
const API_URL = "http://ec2-13-217-71-142.compute-1.amazonaws.com:8081/v1";

describe("organizationService", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    // Mock de localStorage igual que en los otros tests
    Storage.prototype.getItem = jest.fn();
  });

  // --- GET ORGANIZATIONS ---
  it("getOrganizations lanza error si fetch falla", async () => {
    localStorage.getItem = jest.fn().mockReturnValue("fake-token");
    
    // Simular error de red - igual que en userService
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(organizationService.getOrganizations()).rejects.toThrow("Network error");
  });

});