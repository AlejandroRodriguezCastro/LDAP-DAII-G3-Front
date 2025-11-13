// components/admin/__tests__/RolesTab.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import RolesTab from "../components/admin/RolesTab";
import ModalContext from "../components/context/ModalContext";
import { roleService } from "../services/roleService";

// Mocks de los servicios y dependencias
jest.mock("../services/roleService");
jest.mock("../components/admin/RoleFormModalContent", () => {
  return function MockRoleFormModalContent({ title, role, onChange }) {
    return (
      <div data-testid="role-form-modal">
        <h3>{title}</h3>
        <input 
          data-testid="role-name-input"
          value={role.name} 
          onChange={(e) => onChange({...role, name: e.target.value})}
        />
      </div>
    );
  };
});
jest.mock("../components/admin/RolesTable", () => {
  return function MockRolesTable({ roles, handleDelete }) {
    return (
      <div data-testid="roles-table">
        {roles.map(role => (
          <div key={role.id} data-testid={`role-${role.id}`}>
            {role.name}
            <button onClick={() => handleDelete(role)}>Eliminar</button>
          </div>
        ))}
      </div>
    );
  };
});

describe("RolesTab", () => {
  const mockShowModal = jest.fn();
  const mockCurrentUser = { name: "Test User" };

  const mockModalContext = {
    showModal: mockShowModal
  };

  // Mock de localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    
    // Mock por defecto para usuario admin
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "userData") return JSON.stringify({ organization: "admin" });
      if (key === "activeRoles") return JSON.stringify([{ name: "super admin", organization: "admin" }]);
      return null;
    });
  });

  const renderWithContext = (component) => {
    return render(
      <ModalContext.Provider value={mockModalContext}>
        {component}
      </ModalContext.Provider>
    );
  };

  test("renders RolesTab component with header and button", () => {
    renderWithContext(<RolesTab currentUser={mockCurrentUser} />);

    expect(screen.getByText("Gestión de Roles")).toBeInTheDocument();
    expect(screen.getByText("Crear rol")).toBeInTheDocument();
  });

  test("loads roles for admin user on mount", async () => {
    const mockRoles = [
      { id: 1, name: "Admin", organization: "admin" },
      { id: 2, name: "Manager", organization: "admin" }
    ];
    
    roleService.getRoles.mockResolvedValue({ roles: mockRoles });

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(roleService.getRoles).toHaveBeenCalled();
    });
  });

  test("loads roles for non-admin user on mount", async () => {
    // Mock para usuario no-admin
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "userData") return JSON.stringify({ organization: "user-org" });
      if (key === "activeRoles") return JSON.stringify([{ name: "user", organization: "user-org" }]);
      return null;
    });

    const mockRoles = [{ id: 1, name: "User", organization: "user-org" }];
    roleService.getRolesByOrganization.mockResolvedValue({ roles: mockRoles });

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(roleService.getRolesByOrganization).toHaveBeenCalledWith("user-org");
    });
  });

  test("handles create role button click", async () => {
    roleService.getRoles.mockResolvedValue({ roles: [] });

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    const createButton = screen.getByText("Crear rol");
    fireEvent.click(createButton);

    expect(mockShowModal).toHaveBeenCalled();
  });

test("handles role creation successfully", async () => {
  roleService.getRoles.mockResolvedValue({ roles: [] });
  roleService.createRole.mockResolvedValue({});

  await act(async () => {
    renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
  });

  // Hacer click en crear
  const createButton = screen.getByText("Crear rol");
  fireEvent.click(createButton);

  // Verificar que se abrió el modal
  expect(mockShowModal).toHaveBeenCalled();

  // Simular la aceptación del modal
  const modalConfig = mockShowModal.mock.calls[0][0];
  
  // Mock para el refresh
  roleService.getRoles.mockResolvedValue({ roles: [] });

  await act(async () => {
    if (modalConfig.onAccept) {
      await modalConfig.onAccept();
    }
  });

  // Verificar que se intentó crear el rol
  expect(roleService.createRole).toHaveBeenCalled();
});

  test("handles role deletion", async () => {
    const mockRoles = [{ id: 1, name: "Test Role", organization: "admin" }];
    roleService.getRoles.mockResolvedValue({ roles: mockRoles });
    roleService.deleteRole.mockResolvedValue({});

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Role")).toBeInTheDocument();
    });

    // Simular eliminación a través del mock de RolesTable
    const deleteButton = screen.getByText("Eliminar");
    fireEvent.click(deleteButton);

    expect(mockShowModal).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.any(Object),
        acceptText: "Eliminar"
      })
    );

    // Simular confirmación de eliminación
    const modalCall = mockShowModal.mock.calls[0][0];
    await act(async () => {
      await modalCall.onAccept();
    });

    expect(roleService.deleteRole).toHaveBeenCalledWith(1);
  });

  test("handles errors when loading roles", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    roleService.getRoles.mockRejectedValue(new Error("Load error"));

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error loading roles:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test("handles errors when creating role", async () => {
    roleService.getRoles.mockResolvedValue({ roles: [] });
    roleService.createRole.mockRejectedValue(new Error("Create error"));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    const createButton = screen.getByText("Crear rol");
    fireEvent.click(createButton);

    const modalCall = mockShowModal.mock.calls[0][0];
    await act(async () => {
      await modalCall.onAccept();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error creating role:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  test("handles errors when deleting role", async () => {
    const mockRoles = [{ id: 1, name: "Test Role", organization: "admin" }];
    roleService.getRoles.mockResolvedValue({ roles: mockRoles });
    roleService.deleteRole.mockRejectedValue(new Error("Delete error"));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Role")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Eliminar");
    fireEvent.click(deleteButton);

    const modalCall = mockShowModal.mock.calls[0][0];
    await act(async () => {
      await modalCall.onAccept();
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error deleting role:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  test("handles empty roles response", async () => {
    roleService.getRoles.mockResolvedValue({ roles: [] });

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(roleService.getRoles).toHaveBeenCalled();
    });

    // No debería haber errores con respuesta vacía
    expect(screen.getByTestId("roles-table")).toBeInTheDocument();
  });

  test("handles undefined roles response", async () => {
    roleService.getRoles.mockResolvedValue(undefined);

    await act(async () => {
      renderWithContext(<RolesTab currentUser={mockCurrentUser} />);
    });

    await waitFor(() => {
      expect(roleService.getRoles).toHaveBeenCalled();
    });

    // No debería haber errores con respuesta undefined
    expect(screen.getByTestId("roles-table")).toBeInTheDocument();
  });
});