// components/__tests__/UsersTab.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import UsersTab from "../components/admin/UsersTab";
import ModalContext from "../components/context/ModalContext";
import UsersTable from "../components/admin/UsersTable";

import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import { organizationService } from "../services/organizationService";

jest.mock("../services/userService");
jest.mock("../services/roleService");
jest.mock("../services/organizationService");

// Mock UsersTable to simplify and trigger edit/delete callbacks
jest.mock("../components/admin/UsersTable", () => jest.fn(() => <div>UsersTableMock</div>));

const mockShowModal = jest.fn();

const renderWithContext = () =>
  render(
    <ModalContext.Provider value={{ showModal: mockShowModal }}>
      <UsersTab />
    </ModalContext.Provider>
  );

describe("UsersTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("carga datos cuando es admin", async () => {
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super-admin", organization: "admin" }])
    );
    localStorage.setItem(
      "userData",
      JSON.stringify({ organization: "org1" })
    );

    userService.getUsers.mockResolvedValueOnce([{ id: 1 }]);
    roleService.getRoles.mockResolvedValueOnce({ roles: ["r1"] });
    organizationService.getOrganizations.mockResolvedValueOnce({
      organization_units: ["org1", "org2"],
    });

    renderWithContext();

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
      expect(roleService.getRoles).toHaveBeenCalled();
      expect(organizationService.getOrganizations).toHaveBeenCalled();
    });
  });

  test("carga datos cuando NO es admin", async () => {
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "empleado", organization: "org1" }])
    );
    localStorage.setItem(
      "userData",
      JSON.stringify({ organization: "orgUser" })
    );

    userService.getUsersByOrganization.mockResolvedValueOnce([{ id: 10 }]);
    roleService.getRolesByOrganization.mockResolvedValueOnce({
      roles: ["r1"],
    });

    renderWithContext();

    await waitFor(() => {
      expect(userService.getUsersByOrganization).toHaveBeenCalledWith(
        "orgUser"
      );
      expect(roleService.getRolesByOrganization).toHaveBeenCalledWith(
        "orgUser"
      );
      expect(organizationService.getOrganizations).not.toHaveBeenCalled();
    });
  });

  test("renderiza tabla y botón", () => {
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super-admin", organization: "admin" }])
    );
    localStorage.setItem("userData", JSON.stringify({}));

    userService.getUsers.mockResolvedValueOnce([]);
    roleService.getRoles.mockResolvedValueOnce({ roles: [] });
    organizationService.getOrganizations.mockResolvedValueOnce({
      organization_units: [],
    });

    renderWithContext();

    expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Crear usuario")).toBeInTheDocument();
    expect(screen.getByText("UsersTableMock")).toBeInTheDocument();
  });

  test("abre modal al crear usuario", async () => {
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super-admin", organization: "admin" }])
    );
    localStorage.setItem("userData", JSON.stringify({}));

    userService.getUsers.mockResolvedValueOnce([]);
    roleService.getRoles.mockResolvedValueOnce({ roles: [] });
    organizationService.getOrganizations.mockResolvedValueOnce({
      organization_units: [],
    });

    renderWithContext();

    fireEvent.click(screen.getByText("Crear usuario"));

    expect(mockShowModal).toHaveBeenCalled();
  });

  test("handleEdit llama showModal y updateUser", async () => {
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super-admin", organization: "admin" }])
    );
    localStorage.setItem("userData", JSON.stringify({}));

    userService.getUsers.mockResolvedValueOnce([{ id: 1, first_name: "Pepe" }]);
    roleService.getRoles.mockResolvedValueOnce({ roles: [] });
    organizationService.getOrganizations.mockResolvedValueOnce({
      organization_units: [],
    });

    UsersTable.mockImplementation(({ handleEdit }) => (
      <button onClick={() => handleEdit({ id: 1 })}>EditMock</button>
    ));

    renderWithContext();

    fireEvent.click(screen.getByText("EditMock"));

    expect(mockShowModal).toHaveBeenCalled();
  });

  test("handleDelete abre modal y luego elimina usuario", async () => {
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super-admin", organization: "admin" }])
    );
    localStorage.setItem("userData", JSON.stringify({}));

    userService.getUsers.mockResolvedValueOnce([
      { id: 1, mail: "a@a.com", first_name: "A", last_name: "B" },
    ]);
    roleService.getRoles.mockResolvedValueOnce({ roles: [] });
    organizationService.getOrganizations.mockResolvedValueOnce({
      organization_units: [],
    });

    let acceptCallback = null;

    mockShowModal.mockImplementation(({ onAccept }) => {
      acceptCallback = onAccept;
    });

    UsersTable.mockImplementation(({ handleDelete }) => (
      <button onClick={() => handleDelete({ id: 1, mail: "a@a.com" })}>
        DeleteMock
      </button>
    ));

    renderWithContext();

    fireEvent.click(screen.getByText("DeleteMock"));

    expect(mockShowModal).toHaveBeenCalled();

    userService.deleteUser.mockResolvedValueOnce(true);

    await waitFor(() => acceptCallback());

    expect(userService.deleteUser).toHaveBeenCalledWith("a@a.com");
  });
});
test("setUsers se ejecuta cargando usuarios (línea 39)", async () => {
  localStorage.setItem(
    "activeRoles",
    JSON.stringify([{ name: "super-admin", organization: "admin" }])
  );
  localStorage.setItem("userData", JSON.stringify({}));

  userService.getUsers.mockResolvedValueOnce([{ id: 123 }]);
  roleService.getRoles.mockResolvedValueOnce({ roles: [] });
  organizationService.getOrganizations.mockResolvedValueOnce({
    organization_units: [],
  });

  renderWithContext();

  await waitFor(() => {
    expect(userService.getUsers).toHaveBeenCalled();
  });
});
test("handleCreate ejecuta createUser y actualiza estado (líneas 64–75)", async () => {
  localStorage.setItem(
    "activeRoles",
    JSON.stringify([{ name: "super-admin", organization: "admin" }])
  );
  localStorage.setItem("userData", JSON.stringify({}));

  userService.getUsers.mockResolvedValueOnce([]);
  roleService.getRoles.mockResolvedValueOnce({ roles: [] });
  organizationService.getOrganizations.mockResolvedValueOnce({
    organization_units: [],
  });

  let acceptCallback = null;

  mockShowModal.mockImplementation(({ onAccept }) => {
    acceptCallback = onAccept;
  });

  userService.createUser.mockResolvedValueOnce({
    id: 99,
    first_name: "Nuevo",
  });

  renderWithContext();

  fireEvent.click(screen.getByText("Crear usuario"));

  await waitFor(() => acceptCallback());

  expect(userService.createUser).toHaveBeenCalled();
});
test("handleEdit ejecuta updateUser y actualiza lista (líneas 88–99)", async () => {
  localStorage.setItem(
    "activeRoles",
    JSON.stringify([{ name: "super-admin", organization: "admin" }])
  );
  localStorage.setItem("userData", JSON.stringify({}));

  userService.getUsers.mockResolvedValueOnce([{ id: 1 }]);
  roleService.getRoles.mockResolvedValueOnce({ roles: [] });
  organizationService.getOrganizations.mockResolvedValueOnce({
    organization_units: [],
  });

  let acceptCallback = null;

  mockShowModal.mockImplementation(({ onAccept }) => {
    acceptCallback = onAccept;
  });

  UsersTable.mockImplementation(({ handleEdit }) => (
    <button onClick={() => handleEdit({ id: 1 })}>EditItem</button>
  ));

  userService.updateUser.mockResolvedValueOnce({ id: 1, first_name: "Editado" });

  renderWithContext();

  fireEvent.click(screen.getByText("EditItem"));

  await waitFor(() => acceptCallback());

  expect(userService.updateUser).toHaveBeenCalled();
});
