// components/admin/__tests__/UsersTab.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import UsersTab from "../components/admin/UsersTab";
import ModalContext from "../components/context/ModalContext";
import { organizationService } from "../services/organizationService";
import { roleService } from "../services/roleService";
import { userService } from "../services/userService";

// Mocks de servicios
jest.mock("../services/organizationService");
jest.mock("../services/roleService");
jest.mock("../services/userService");

// Mock simplificado de componentes hijos
jest.mock("../components/UserFormModalContent", () => ({
  __esModule: true,
  default: function MockUserFormModalContent({ title }) {
    return <div data-testid="user-form-modal">{title}</div>;
  }
}));

jest.mock("../components/admin/UsersTable", () => ({
  __esModule: true,
  default: function MockUsersTable({ users }) {
    return (
      <div data-testid="users-table">
        {users?.length ? users.map(user => (
          <div key={user.id} data-testid={`user-${user.id}`}>
            {user.first_name} {user.last_name}
          </div>
        )) : "No users"}
      </div>
    );
  }
}));

describe("UsersTab", () => {
  const mockShowModal = jest.fn();
  const mockModalContext = {
    showModal: mockShowModal
  };

  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  // Datos de prueba
  const mockUsers = [
    { id: 1, first_name: "John", last_name: "Doe", mail: "john@test.com" },
    { id: 2, first_name: "Jane", last_name: "Smith", mail: "jane@test.com" }
  ];

  const mockRoles = { roles: [
    { id: 1, name: "Admin", organization: "admin" }
  ]};

  const mockOrganizations = { organization_units: [
    { ou: ["admin"] }
  ]};

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { 
      value: mockLocalStorage,
      writable: true
    });
    
    // Mock por defecto para usuario admin
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "activeRoles") return JSON.stringify([{ name: "super admin", organization: "admin" }]);
      if (key === "userData") return JSON.stringify({ organization: "admin" });
      return null;
    });

    // Mocks por defecto de servicios
    userService.getUsers.mockResolvedValue(mockUsers);
    roleService.getRoles.mockResolvedValue(mockRoles);
    organizationService.getOrganizations.mockResolvedValue(mockOrganizations);
    userService.createUser.mockResolvedValue({ id: 3, first_name: "New", last_name: "User" });
    userService.updateUser.mockResolvedValue(mockUsers[0]);
    userService.deleteUser.mockResolvedValue(true);
  });

  const renderWithContext = () => {
    return render(
      <ModalContext.Provider value={mockModalContext}>
        <UsersTab />
      </ModalContext.Provider>
    );
  };

  // Test básico de renderizado
  test("renders UsersTab component", async () => {
    await act(async () => {
      renderWithContext();
    });

    expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Crear usuario")).toBeInTheDocument();
  });

  // Test de carga de datos para admin
  test("loads data for admin user", async () => {
    await act(async () => {
      renderWithContext();
    });

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
      expect(roleService.getRoles).toHaveBeenCalled();
      expect(organizationService.getOrganizations).toHaveBeenCalled();
    });
  });

  // Test de carga de datos para non-admin
  test("loads data for non-admin user", async () => {
    // Mock para usuario no-admin
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "activeRoles") return JSON.stringify([{ name: "user", organization: "user-org" }]);
      if (key === "userData") return JSON.stringify({ organization: "user-org" });
      return null;
    });

    userService.getUsersByOrganization.mockResolvedValue(mockUsers);
    roleService.getRolesByOrganization.mockResolvedValue(mockRoles);

    await act(async () => {
      renderWithContext();
    });

    await waitFor(() => {
      expect(userService.getUsersByOrganization).toHaveBeenCalledWith("user-org");
      expect(roleService.getRolesByOrganization).toHaveBeenCalledWith("user-org");
    });
  });

  // Test de creación de usuario
  test("handles create user", async () => {
    await act(async () => {
      renderWithContext();
    });

    const createButton = screen.getByText("Crear usuario");
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(mockShowModal).toHaveBeenCalled();
  });

  // Test de manejo de errores
  test("handles loading errors", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userService.getUsers.mockRejectedValue(new Error("Load error"));

    await act(async () => {
      renderWithContext();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error loading data:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  // Test simple de que el componente se monta
  test("component mounts without errors", async () => {
    await act(async () => {
      renderWithContext();
    });
    
    // Si no hay error, el test pasa
    expect(screen.getByRole('button', { name: /crear usuario/i })).toBeInTheDocument();
  });
});