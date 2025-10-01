import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword";
import { authService } from "../services/authService";

jest.mock("../services/authService", () => ({
  authService: { recoverPassword: jest.fn() },
}));

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (msg.includes("React Router Future Flag Warning")) return;
    console.warn(msg);
  });
});


describe("ForgotPassword Page", () => {
  it("muestra mensaje de éxito", async () => {
    authService.recoverPassword.mockResolvedValueOnce({ success: true });
    render(<BrowserRouter><ForgotPassword /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@citypass.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/recibirás un enlace/i)).toBeInTheDocument();
  });
});
