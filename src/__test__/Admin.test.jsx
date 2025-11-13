import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Admin from "../pages/Admin";
import { authService } from "../services/authService";
import { roleService } from "../services/roleService";

jest.mock("../services/authService", () => ({
  authService: {
    getUser: jest.fn(() => ({ id: "me", role: "super" })),
    logout: jest.fn(),
  },
}));

jest.mock("../services/roleService", () => ({
  roleService: {
    getRoles: jest.fn(),
  },
}));

describe("Admin page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders normally when roles load correctly", async () => {
    roleService.getRoles.mockResolvedValueOnce({ roles: [] });
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() => expect(roleService.getRoles).toHaveBeenCalled());
  });

  it("handles logout correctly", async () => {
    roleService.getRoles.mockResolvedValueOnce({ roles: [] });
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    const logoutBtn = await screen.findByRole("button", { name: /cerrar sesión/i });
    fireEvent.click(logoutBtn);
    expect(authService.logout).toHaveBeenCalled();
  });

  it("shows error message if getRoles fails (covers line 32)", async () => {
    roleService.getRoles.mockRejectedValueOnce(new Error("Error fetching roles"));
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    await waitFor(() =>
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    );
  });
});
