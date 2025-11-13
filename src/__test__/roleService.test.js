import { roleService } from "../services/roleService";

global.fetch = jest.fn();
const API_URL = "http://ec2-13-217-71-142.compute-1.amazonaws.com:8081/v1";

describe("roleService", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  // --- GET ALL ROLES ---
  it("getRoles devuelve lista de roles correctamente", async () => {
    const mockResponse = [{ id: 1, name: "Admin" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await roleService.getRoles();
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/roles/`, expect.any(Object));
  });

  it("getRoles lanza error si el fetch falla", async () => {
    fetch.mockResolvedValueOnce({ ok: false, statusText: "Not Found" });
    await expect(roleService.getRoles()).rejects.toThrow("Error fetching roles");
  });

  // --- GET BY ORGANIZATION ---
  it("getRolesByOrganization devuelve roles filtrados", async () => {
    localStorage.setItem("authToken", "fake-token");
    const mockResponse = [{ id: 1, name: "User", organization: "OrgA" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await roleService.getRolesByOrganization("OrgA");
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/roles/organization/OrgA`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("getRolesByOrganization lanza error si falla", async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(roleService.getRolesByOrganization("OrgA")).rejects.toThrow(
      "Error al obtener roles"
    );
  });

  // --- CREATE ROLE ---
  it("createRole crea un nuevo rol correctamente", async () => {
    const mockRole = { id: 2, name: "Nuevo", description: "desc", organization: "OrgB" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRole,
    });

    const result = await roleService.createRole(mockRole);
    expect(result).toEqual(mockRole);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/roles/`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("createRole lanza error si falla el POST", async () => {
    fetch.mockResolvedValueOnce({ ok: false, statusText: "Bad Request" });
    await expect(roleService.createRole({})).rejects.toThrow("Error creating role");
  });

  // --- UPDATE ROLE ---
  it("updateRole actualiza un rol correctamente", async () => {
    const mockUpdated = { id: 3, name: "Actualizado" };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdated,
    });

    const result = await roleService.updateRole(3, { name: "Actualizado" });
    expect(result).toEqual(mockUpdated);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/roles/3`,
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("updateRole lanza error si falla el PUT", async () => {
    fetch.mockResolvedValueOnce({ ok: false, statusText: "Server Error" });
    await expect(roleService.updateRole(1, {})).rejects.toThrow("Error updating role");
  });

  // --- DELETE ROLE ---
  it("deleteRole elimina un rol correctamente", async () => {
    const mockResponse = { success: true };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await roleService.deleteRole(10);
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/roles/10`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("deleteRole lanza error si falla el DELETE", async () => {
    fetch.mockResolvedValueOnce({ ok: false, statusText: "Forbidden" });
    await expect(roleService.deleteRole(10)).rejects.toThrow("Error deleting role");
  });
});
