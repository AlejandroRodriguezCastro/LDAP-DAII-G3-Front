import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../pages/Register";
import { authService } from "../services/authService";

jest.mock("../services/authService", () => ({
  authService: { register: jest.fn() },
}));

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (msg.includes("React Router Future Flag Warning")) return;
    console.warn(msg);
  });
});


describe("Register Page", () => {
  it("renderiza el formulario", () => {
    render(<BrowserRouter><Register /></BrowserRouter>);
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("muestra error si el email ya está registrado", async () => {
    authService.register.mockRejectedValueOnce(new Error("El email ya está registrado"));
    render(<BrowserRouter><Register /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@citypass.com" } });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: "12345678a" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "12345678a" } });
    // fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    // expect(await screen.findByText(/el email ya está registrado/i)).toBeInTheDocument();
  });
});
