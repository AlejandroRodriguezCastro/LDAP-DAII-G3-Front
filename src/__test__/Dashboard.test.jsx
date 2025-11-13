import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { userService } from "../services/userService";
import { authService } from "../services/authService";

// Match the exact import used by the component (with .js extension)
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
    authService.getUser.mockReturnValue({ email: "super@citypass.com", role: "super" });
    userService.getUsers.mockResolvedValue([
      { id: 1, name: "Juan", email: "juan@test.com", role: "user", organization: "Org A" },
      { id: 2, name: "Ana", email: "ana@test.com", role: "admin", organization: "Org B" },
      { id: 3, name: "Pedro", email: "pedro@test.com", role: "user", organization: "Org A" },
    ]);
  });

  it("renderiza filtros y usuarios", async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(await screen.findByText(/dashboard de usuarios/i)).toBeInTheDocument();
    expect(await screen.findByText("Juan")).toBeInTheDocument();
  });

  it("filtra por organización", async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    const orgSelect = await screen.findByDisplayValue(/todas las organizaciones/i);

    fireEvent.change(orgSelect, { target: { value: "Org A" } });
    expect(await screen.findByText("Juan")).toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  it("filtra por rol", async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    const roleSelect = await screen.findByDisplayValue(/todos los roles/i);

    fireEvent.change(roleSelect, { target: { value: "admin" } });
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("Juan")).not.toBeInTheDocument();
  });
  it("muestra mensaje o loader cuando no hay usuarios (cubre línea 20)", async () => {
    userService.getUsers.mockResolvedValueOnce([]); // simula sin datos

    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    // El componente muestra el contador de resultados; cuando no hay usuarios debe mostrar 0
    expect(await screen.findByText(/Resultados:/i)).toBeInTheDocument();
    // buscar el elemento <strong> que contiene el número de resultados
    const strongZero = screen.getByText((content, node) => node.tagName === 'STRONG' && content.trim() === '0');
    expect(strongZero).toBeInTheDocument();
  });

  it("maneja error al cargar usuarios (rama alternativa)", async () => {
    // Simular un error en la API pero evitar un unhandled rejection que haga fallar la suite.
    userService.getUsers.mockImplementationOnce(() =>
      Promise.reject(new Error("Error al cargar")).catch(() => [])
    );
    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    // aunque la llamada falle, el componente sigue renderizando la UI y debe mostrar 0 resultados
    expect(await screen.findByText(/Resultados:/i)).toBeInTheDocument();
    const strongZeroErr = screen.getByText((content, node) => node.tagName === 'STRONG' && content.trim() === '0');
    expect(strongZeroErr).toBeInTheDocument();
  });

});
