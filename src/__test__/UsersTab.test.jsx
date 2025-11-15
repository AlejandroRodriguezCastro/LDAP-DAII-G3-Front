// UsersTab.test.jsx
// Test optimizado para lograr 80%+ de cobertura en UsersTab

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UsersTab from "../components/admin/UsersTab";
import ModalContext from "../components/context/ModalContext";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import { organizationService } from "../services/organizationService";
import { useCheckToken } from "../components/hooks/checkToken";

jest.mock("../services/userService");
jest.mock("../services/roleService");
jest.mock("../services/organizationService");
jest.mock("../components/hooks/checkToken");

const mockShowModal = jest.fn();
const wrapper = (ui) => (
  <ModalContext.Provider value={{ showModal: mockShowModal }}>
    {ui}
  </ModalContext.Provider>
);

describe("UsersTab – cobertura optimizada", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super_admin", organization: "admin" }])
    );

    localStorage.setItem(
      "userData",
      JSON.stringify({ mail: "admin@test.com", organization: "org1" })
    );

    // Siempre token válido
    useCheckToken.mockReturnValue(() => true);
  });

  test("carga datos como admin", async () => {
    userService.getUsers.mockResolvedValue([
      { id: 1, mail: "a@test.com" },
      { id: 2, mail: "admin@test.com" }
    ]);
    roleService.getRoles.mockResolvedValue({ roles: [{ id: 10 }] });
    organizationService.getOrganizations.mockResolvedValue({
      organization_units: [{ id: 20 }]
    });

    render(wrapper(<UsersTab />));

    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
      expect(roleService.getRoles).toHaveBeenCalled();
      expect(organizationService.getOrganizations).toHaveBeenCalled();
    });

    expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
  });

  test("abre modal al crear usuario", async () => {
    userService.getUsers.mockResolvedValue([]);
    roleService.getRoles.mockResolvedValue({ roles: [] });
    organizationService.getOrganizations.mockResolvedValue({
      organization_units: []
    });

    render(wrapper(<UsersTab />));

    const btn = await screen.findByText("Crear usuario");
    fireEvent.click(btn);

    expect(mockShowModal).toHaveBeenCalled();
  });

  test("ejecuta creación de usuario", async () => {
    userService.getUsers.mockResolvedValue([]);
    roleService.getRoles.mockResolvedValue({ roles: [] });
    organizationService.getOrganizations.mockResolvedValue({
      organization_units: []
    });

    userService.createUser.mockResolvedValue({
      id: 9,
      mail: "nuevo@test.com"
    });

    mockShowModal.mockImplementation(({ onAccept }) => {
      onAccept();
    });

    render(wrapper(<UsersTab />));

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalled();
    });
  });

  test("edita un usuario y llama a updateUser", async () => {
    userService.getUsers.mockResolvedValue([
      {
        id: 1,
        mail: "a@test.com",
        first_name: "Juan",
        last_name: "Pérez",
        organization: "org1",
        roles: []
      }
    ]);
    roleService.getRoles.mockResolvedValue({ roles: [] });
    organizationService.getOrganizations.mockResolvedValue({
      organization_units: []
    });

    userService.updateUser.mockResolvedValue({
      id: 1,
      mail: "a@test.com",
      first_name: "Modificado",
      last_name: "Pérez"
    });

    render(wrapper(<UsersTab />));

    // Editar → buscar el ícono EDIT
    const editBtn = await screen.findAllByText("edit");
    fireEvent.click(editBtn[0]);

    mockShowModal.mockImplementation(({ onAccept }) => onAccept());

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalled();
    });
  });

  test("elimina un usuario y llama deleteUser", async () => {
    userService.getUsers.mockResolvedValue([
      {
        id: 1,
        mail: "a@test.com",
        first_name: "Juan",
        last_name: "Pérez",
        organization: "org1",
        roles: []
      }
    ]);
    roleService.getRoles.mockResolvedValue({ roles: [] });
    organizationService.getOrganizations.mockResolvedValue({
      organization_units: []
    });

    userService.deleteUser.mockResolvedValue({});

    render(wrapper(<UsersTab />));

    // Eliminar → buscar ícono DELETE
    const deleteBtn = await screen.findAllByText("delete");
    fireEvent.click(deleteBtn[0]);

    mockShowModal.mockImplementation(({ onAccept }) => onAccept());

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith("a@test.com");
    });
  });
});
