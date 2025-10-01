import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { authService } from "../services/authService";

jest.mock("../services/authService", () => ({
  authService: { login: jest.fn() },
}));

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (msg.includes("React Router Future Flag Warning")) return;
    console.warn(msg);
  });
});


describe("Login Page", () => {
  it("renderiza el formulario", () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("muestra error si credenciales inválidas", async () => {
    authService.login.mockRejectedValueOnce(new Error("Credenciales inválidas"));
    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  });
});
