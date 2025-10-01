import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Admin from "../pages/Admin";

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

jest.mock("../services/authService", () => ({
  authService: {
    getUser: jest.fn(() => ({ id: "me", role: "super" })), // super => organización requerida
    logout: jest.fn(),
  },
}));

describe("Admin Page", () => {
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

    // Esperar que cargue la tabla inicial
    await screen.findByText("Juan");

    // Completar formulario (incluye Organización porque el rol es super)
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "ana@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Organización/i), {
      target: { value: "Org B" },
    });
    fireEvent.change(screen.getByDisplayValue("Usuario"), {
      target: { value: "user" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    // Debería aparecer "Ana" en la tabla
    expect(await screen.findByText("Ana")).toBeInTheDocument();
  });
});
