// services/__tests__/userService.test.js
import { userService } from "../services/userService";

global.fetch = jest.fn();
const API_URL = "https://auth.grupoldap.com.ar/v1";

describe("userService", () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    // Mock de localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  // --- GET USER ---
  it("getUser devuelve usuario correctamente", async () => {
    const mockUser = { mail: "test@test.com", name: "Test User" };
    localStorage.getItem.mockReturnValue("fake-token");
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const result = await userService.getUser("test@test.com");
    
    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/user/get-user/?user_mail=test%40test.com`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("getUser lanza error si el fetch falla", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockResolvedValueOnce({ ok: false });
    
    await expect(userService.getUser("test@test.com")).rejects.toThrow("Error al obtener usuario");
  });

  it("getUser lanza error cuando hay excepción en fetch", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    await expect(userService.getUser("test@test.com")).rejects.toThrow("Network error");
  });

  // --- GET USERS ---
  it("getUsers devuelve lista de usuarios correctamente", async () => {
    const mockUsers = [{ mail: "user1@test.com" }, { mail: "user2@test.com" }];
    localStorage.getItem.mockReturnValue("fake-token");
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    const result = await userService.getUsers();
    
    expect(result).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/user/all`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("getUsers lanza error si falla", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockResolvedValueOnce({ ok: false });
    
    await expect(userService.getUsers()).rejects.toThrow("Error al obtener usuarios");
  });

  it("getUsers lanza error cuando hay excepción en fetch", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    await expect(userService.getUsers()).rejects.toThrow("Network error");
  });

  // --- GET USERS BY ORGANIZATION ---
  it("getUsersByOrganization devuelve usuarios filtrados", async () => {
    const mockUsers = [{ mail: "user@org.com", organization: "TestOrg" }];
    localStorage.getItem.mockReturnValue("fake-token");
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    const result = await userService.getUsersByOrganization("TestOrg");
    
    expect(result).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/user/by-organization/TestOrg`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("getUsersByOrganization lanza error si falla", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockResolvedValueOnce({ ok: false });
    
    await expect(userService.getUsersByOrganization("TestOrg"))
      .rejects.toThrow("Error al obtener usuarios");
  });

  it("getUsersByOrganization lanza error cuando hay excepción en fetch", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    await expect(userService.getUsersByOrganization("TestOrg"))
      .rejects.toThrow("Network error");
  });

  // --- CREATE USER ---
  it("createUser crea usuario correctamente", async () => {
    const mockUser = { 
      first_name: "John", 
      last_name: "Doe", 
      mail: "john@test.com",
      roles: ["user"]
    };
    const mockResponse = { ...mockUser, id: 1 };
    
    localStorage.getItem.mockImplementation((key) => {
      if (key === "authToken") return "fake-token";
      if (key === "userData") return JSON.stringify({ organization: "TestOrg" });
      return null;
    });
    
    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    const result = await userService.createUser(mockUser);
    
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/user`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "X-Request-Name": "createUser",
        }),
      })
    );
  });

  it("createUser usa valores por defecto correctamente", async () => {
    const mockUser = { 
      mail: "test@test.com",
      roles: ["user"]
    };
    const mockResponse = { ...mockUser, id: 1 };
    
    localStorage.getItem.mockImplementation((key) => {
      if (key === "authToken") return "fake-token";
      if (key === "userData") return JSON.stringify({ organization: "TestOrg" });
      return null;
    });
    
    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    await userService.createUser(mockUser);
    
    const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(requestBody.organization).toBe("TestOrg");
    expect(requestBody.telephone_number).toBe("000-000-0000");
    expect(requestBody.password).toBe("userpass123!");
  });

  it("createUser lanza error cuando hay excepción en fetch", async () => {
    const mockUser = { 
      first_name: "John", 
      mail: "john@test.com",
      roles: ["user"]
    };
    
    localStorage.getItem.mockImplementation((key) => {
      if (key === "authToken") return "fake-token";
      if (key === "userData") return JSON.stringify({ organization: "TestOrg" });
      return null;
    });
    
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(userService.createUser(mockUser)).rejects.toThrow("Network error");
  });

  it("createUser maneja usuario sin first_name y last_name", async () => {
    const mockUser = { 
      mail: "test@test.com",
      roles: ["user"]
    };
    const mockResponse = { ...mockUser, id: 1 };
    
    localStorage.getItem.mockImplementation((key) => {
      if (key === "authToken") return "fake-token";
      if (key === "userData") return null; // Sin userData en localStorage
      return null;
    });
    
    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    await userService.createUser(mockUser);
    
    const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(requestBody.organization).toBe("admin");
    expect(requestBody.password).toBe("userpass123!");
  });

  // --- UPDATE USER ---
  it("updateUser actualiza usuario correctamente", async () => {
    const mockUser = { mail: "test@test.com", name: "Updated Name" };
    localStorage.getItem.mockReturnValue("fake-token");
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const result = await userService.updateUser(mockUser);
    
    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/user/test@test.com`,
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "X-Request-Name": "updateUser",
        }),
      })
    );
  });

  it("updateUser lanza error si falla", async () => {
    const mockUser = { mail: "test@test.com" };
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockResolvedValueOnce({ ok: false });
    
    await expect(userService.updateUser(mockUser)).rejects.toThrow("Error al actualizar usuario");
  });

  it("updateUser lanza error cuando hay excepción en fetch", async () => {
    const mockUser = { mail: "test@test.com" };
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    await expect(userService.updateUser(mockUser)).rejects.toThrow("Network error");
  });

  // --- DELETE USER ---
  it("deleteUser elimina usuario correctamente", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    const result = await userService.deleteUser("test@test.com");
    
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/user/test@test.com`,
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "X-Request-Name": "deleteUser",
        }),
      })
    );
  });

  it("deleteUser lanza error si falla", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockResolvedValueOnce({ ok: false });
    
    await expect(userService.deleteUser("test@test.com")).rejects.toThrow("Error al eliminar usuario");
  });

  it("deleteUser lanza error cuando hay excepción en fetch", async () => {
    localStorage.getItem.mockReturnValue("fake-token");
    fetch.mockRejectedValueOnce(new Error("Network error"));
    
    await expect(userService.deleteUser("test@test.com")).rejects.toThrow("Network error");
  });
  
});