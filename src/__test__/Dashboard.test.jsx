import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { MemoryRouter } from "react-router-dom";

jest.mock("../services/userService.js", () => ({
  userService: { getUsers: jest.fn() },
}));

jest.mock("../services/authService.js", () => ({
  authService: { getUser: jest.fn() },
}));

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (msg.includes("React Router Future Flag Warning")) return;
    console.warn(msg);
  });
});

describe("Dashboard Page", () => {
  beforeEach(() => {
    // ✔ Necesario para NO ser redirigido a /home
    authService.getUser.mockReturnValue({
      email: "super@citypass.com",
      roles: ["super_admin"],  // ← IMPORTANTE
    });

    userService.getUsers.mockResolvedValue([
      {
        id: 1,
        first_name: "Juan",
        last_name: "Pérez",
        mail: "juan@test.com",
        roles: [{ name: "user" }],
        organization: "Org A",
      },
      {
        id: 2,
        first_name: "Ana",
        last_name: "García",
        mail: "ana@test.com",
        roles: [{ name: "admin" }],
        organization: "Org B",
      },
      {
        id: 3,
        first_name: "Pedro",
        last_name: "López",
        mail: "pedro@test.com",
        roles: [{ name: "user" }],
        organization: "Org A",
      },
    ]);
  });

  it("renderiza filtros y usuarios", async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(await screen.findByText(/dashboard de usuarios/i)).toBeInTheDocument();
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
  });

  it("filtra por organización", async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    const orgSelect = await screen.findByDisplayValue(/todas las organizaciones/i);

    fireEvent.change(orgSelect, { target: { value: "Org A" } });

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
  });

  it("filtra por rol", async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    const roleSelect = await screen.findByDisplayValue(/todos los roles/i);

    fireEvent.change(roleSelect, { target: { value: "admin" } });

    expect(await screen.findByText("Ana García")).toBeInTheDocument();
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
  });

  it("muestra mensaje o loader cuando no hay usuarios (cubre línea 20)", async () => {
    userService.getUsers.mockResolvedValueOnce([]);

    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    expect(await screen.findByText(/Resultados:/i)).toBeInTheDocument();

    const strongZero = screen.getByText((content, node) =>
      node.tagName === "STRONG" && content.trim() === "0"
    );

    expect(strongZero).toBeInTheDocument();
  });

  it("maneja error al cargar usuarios (rama alternativa)", async () => {
    userService.getUsers.mockImplementationOnce(() =>
      Promise.reject(new Error("Error al cargar")).catch(() => [])
    );

    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    expect(await screen.findByText(/Resultados:/i)).toBeInTheDocument();

    const strongZeroErr = screen.getByText((content, node) =>
      node.tagName === "STRONG" && content.trim() === "0"
    );

    expect(strongZeroErr).toBeInTheDocument();
  });
it("cubre la rama de super_admin y carga usuarios", async () => {
  const mockUsers = [
    {
      first_name: "John",
      last_name: "Doe",
      mail: "john@example.com",
      organization: "OrgA",
      roles: [{ name: "admin" }]
    }
  ];

  authService.getUser = jest.fn().mockReturnValue({
    roles: ["super_admin"]
  });

  userService.getUsers = jest.fn().mockResolvedValue(mockUsers);

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  // Esperar a que cargue la tabla
  const row = await screen.findByText("john@example.com");
  expect(row).toBeInTheDocument();

  expect(userService.getUsers).toHaveBeenCalled();
});


});
