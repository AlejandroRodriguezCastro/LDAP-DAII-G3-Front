import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Admin from "../pages/Admin";
import { authService } from "../services/authService"; // 👈 para acceder al mock

// Mock de userService
jest.mock("../services/userService", () => ({
  userService: {
    getUsers: jest.fn().mockResolvedValue([
      { id: 1, name: "Juan", email: "juan@test.com", role: "user", organization: "Org A" },
    ]),
    createUser: jest.fn(async (u) => ({ id: Date.now(), ...u })),
    updateUser: jest.fn(async (id, data) => ({ id, ...data })),
    deleteUser: jest.fn().mockResolvedValue(true),
  },
}));

// Mock de authService
jest.mock("../services/authService", () => {
  return {
    authService: {
      getUser: jest.fn(() => ({ id: "me", role: "super" })), // rol super
      logout: jest.fn(),
    },
  };
});

describe("Admin Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza usuarios", async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    expect(await screen.findByText("Juan")).toBeInTheDocument();
  });

  it("permite crear usuario", async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    await screen.findByText("Juan");

    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "ana@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Organización/i), {
      target: { value: "Org B" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    expect(await screen.findByText("Ana")).toBeInTheDocument();
  });

  it("permite editar usuario", async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    await screen.findByText("Juan");

    fireEvent.click(screen.getByRole("button", { name: /editar/i }));

    const input = screen.getByDisplayValue("Juan");
    fireEvent.change(input, { target: { value: "Juan Editado" } });

    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText("Juan Editado")).toBeInTheDocument();
  });

  it("permite eliminar usuario", async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    await screen.findByText("Juan");

    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() =>
      expect(screen.queryByText("Juan")).not.toBeInTheDocument()
    );
  });

  it("aplica filtro de organización", async () => {
    render(
        <BrowserRouter>
        <Admin />
        </BrowserRouter>
    );

    await screen.findByText("Juan");

    // ✅ agarramos el primer select (el de filtro)
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Org A" } });

    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  it("cierra sesión correctamente", async () => {
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    await screen.findByText("Juan");

    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(authService.logout).toHaveBeenCalled(); // ✅
  });
});
