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
  it("getOrganizations devuelve organizaciones correctamente", async () => {
    const mockOrganizations = [
      { ou: ["admin"] },
      { ou: ["user-org"] }
    ];
    
    // Mock igual que en roleService
    localStorage.getItem = jest.fn().mockReturnValue("fake-token");
    
    fetch.mockResolvedValueOnce({
      json: async () => mockOrganizations,
    });

    const result = await organizationService.getOrganizations();

    expect(result).toEqual(mockOrganizations);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/v1/organization_units/`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("getOrganizations lanza error si fetch falla", async () => {
    localStorage.getItem = jest.fn().mockReturnValue("fake-token");
    
    // Simular error de red - igual que en userService
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(organizationService.getOrganizations()).rejects.toThrow("Network error");
  });

  it("getOrganizations funciona sin token", async () => {
    // Sin token en localStorage
    localStorage.getItem = jest.fn().mockReturnValue(null);
    
    const mockOrganizations = [{ ou: ["public"] }];
    
    fetch.mockResolvedValueOnce({
      json: async () => mockOrganizations,
    });

    const result = await organizationService.getOrganizations();

    expect(result).toEqual(mockOrganizations);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/v1/organization_units/`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer null",
        }),
      })
    );
  });
});