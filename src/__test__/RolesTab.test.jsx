// components/admin/__tests__/RolesTab.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import RolesTab from "../components/admin/RolesTab";
import ModalContext from "../components/context/ModalContext";

import { roleService } from "../services/roleService";
import { organizationService } from "../services/organizationService";

// Mocks
jest.mock("../services/roleService");
jest.mock("../services/organizationService", () => ({
  organizationService: {
    getOrganizations: jest.fn(),
  },
}));

jest.mock("../components/admin/RoleFormModalContent", () => {
  return function MockRoleFormModalContent({ title, role, onChange }) {
    return (
      <div data-testid="role-form-modal">
        <h3>{title}</h3>
        <input
          data-testid="role-name-input"
          value={role.name}
          onChange={(e) => onChange({ ...role, name: e.target.value })}
        />
      </div>
    );
  };
});

jest.mock("../components/admin/RolesTable", () => {
  return function MockRolesTable({ roles, handleDelete }) {
    return (
      <div data-testid="roles-table">
        {roles.map((role) => (
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

  const mockModalContext = {
    showModal: mockShowModal,
  };

  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  const renderWithContext = (component) => {
    return render(
      <ModalContext.Provider value={mockModalContext}>
        {component}
      </ModalContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "userData") return JSON.stringify({ organization: "admin" });
      if (key === "activeRoles")
        return JSON.stringify([{ name: "super admin", organization: "admin" }]);
      return null;
    });

    // Default mocks
    organizationService.getOrganizations.mockResolvedValue({
      organization_units: [],
    });

    roleService.getRoles.mockResolvedValue({ roles: [] });
  });

  test("renders RolesTab component with header and button", () => {
    renderWithContext(<RolesTab />);
    expect(screen.getByText("Gestión de Roles")).toBeInTheDocument();
    expect(screen.getByText("Crear rol")).toBeInTheDocument();
  });

  test("loads roles for admin user on mount", async () => {
    const mockRoles = [
      { id: 1, name: "Admin", organization: "admin" },
      { id: 2, name: "Manager", organization: "admin" },
    ];

    roleService.getRoles.mockResolvedValue({ roles: mockRoles });

    await act(async () => {
      renderWithContext(<RolesTab />);
    });

    await waitFor(() => {
      expect(roleService.getRoles).toHaveBeenCalled();
    });
  });

  test("handles role deletion", async () => {
    const mockRoles = [{ id: 1, name: "Test Role", organization: "admin" }];

    roleService.getRoles.mockResolvedValue({ roles: mockRoles });

    await act(async () => {
      renderWithContext(<RolesTab />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Role")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Eliminar"));

    expect(mockShowModal).toHaveBeenCalled();

    const modalCall = mockShowModal.mock.calls[0][0];

    roleService.deleteRole.mockResolvedValue({});

    await act(async () => {
      await modalCall.onAccept();
    });

    expect(roleService.deleteRole).toHaveBeenCalledWith(1);
  });

  test("handles errors when loading roles", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Force getRoles to fail
    roleService.getRoles.mockRejectedValue(new Error("Load error"));

    await act(async () => {
      renderWithContext(<RolesTab />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading roles/organizations:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  test("handles errors when deleting role", async () => {
    const mockRoles = [{ id: 1, name: "Test Role", organization: "admin" }];

    roleService.getRoles.mockResolvedValue({ roles: mockRoles });
    roleService.deleteRole.mockRejectedValue(new Error("Delete error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      renderWithContext(<RolesTab />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Role")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Eliminar"));

    const modalCall = mockShowModal.mock.calls[0][0];

    await act(async () => {
      await modalCall.onAccept();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error deleting role:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
  test("loads roles for non-admin user and sets organizationsOptions undefined", async () => {
  mockLocalStorage.getItem.mockImplementation((key) => {
    if (key === "userData") return JSON.stringify({ organization: "sales" });
    if (key === "activeRoles")
      return JSON.stringify([{ name: "employee", organization: "sales" }]);
    return null;
  });

  roleService.getRolesByOrganization = jest.fn().mockResolvedValue({
    roles: [{ id: 9, name: "Vendedor" }],
  });

  await act(async () => {
    renderWithContext(<RolesTab />);
  });

  await waitFor(() => {
    expect(roleService.getRolesByOrganization).toHaveBeenCalledWith("sales");
  });

  // organizationsOptions debe ser undefined → NO llama getOrganizations
  expect(organizationService.getOrganizations).not.toHaveBeenCalled();
});
test("handleCreate triggers modal, calls createRole and refreshes roles", async () => {
  const mockRolesAfter = { roles: [{ id: 123, name: "NuevoRol" }] };

  roleService.createRole.mockResolvedValue({});
  roleService.getRoles.mockResolvedValue(mockRolesAfter);

  let acceptCallback = null;

  mockShowModal.mockImplementation(({ onAccept }) => {
    acceptCallback = onAccept;
  });

  await act(async () => {
    renderWithContext(<RolesTab />);
  });

  fireEvent.click(screen.getByText("Crear rol"));

  // Ejecutamos onAccept real
  await act(async () => {
    await acceptCallback();
  });

  expect(roleService.createRole).toHaveBeenCalled();
  expect(roleService.getRoles).toHaveBeenCalled();
});

});
