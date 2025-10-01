import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { authService } from "../services/authService";

// 🔹 Mock de useNavigate para verificar redirecciones
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// 🔹 Mock de authService
jest.mock("../services/authService", () => ({
  authService: { login: jest.fn() },
}));

beforeAll(() => {
  // Silenciar warnings de React Router en los tests
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (msg.includes("React Router Future Flag Warning")) return;
    console.warn(msg);
  });
});

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("muestra error si credenciales inválidas", async () => {
    authService.login.mockRejectedValueOnce(new Error("Credenciales inválidas"));
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  });

  it("redirige a /admin si el rol es admin", async () => {
    authService.login.mockResolvedValueOnce({ user: { role: "admin" } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("redirige a /admin si el rol es super", async () => {
    authService.login.mockResolvedValueOnce({ user: { role: "super" } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "super@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("redirige a /home si el rol es user", async () => {
    authService.login.mockResolvedValueOnce({ user: { role: "user" } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });
  });
});
