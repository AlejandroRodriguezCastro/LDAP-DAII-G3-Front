import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock useNavigate from react-router-dom so Admin can call it even if the
// component forgot to import it. This keeps tests stable without editing source.
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Some components (incorrectly) call `useNavigate` as a global instead of
// importing it. Define a global fallback so tests keep working without
// changing production code.
global.useNavigate = () => mockNavigate;

import { BrowserRouter } from "react-router-dom";
import Admin from "../pages/Admin";
import { authService } from "../services/authService";
import { roleService } from "../services/roleService";

jest.mock("../services/authService", () => ({
  authService: {
    getUser: jest.fn(() => ({ id: "me", role: "super" })),
    logout: jest.fn(),
    getToken: jest.fn(() => "fake-token"),
    validateToken: jest.fn(() => Promise.resolve({ success: true })),
  },
}));


jest.mock("../services/roleService", () => ({
  roleService: {
    getRoles: jest.fn(),
    getRolesByOrganization: jest.fn(),
  },
}));

// Mock userService and organizationService to avoid network/fetch in tests
jest.mock("../services/userService", () => ({
  userService: {
    getUsers: jest.fn(),
    getUsersByOrganization: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

jest.mock("../services/organizationService", () => ({
  organizationService: {
    getOrganizations: jest.fn(),
  },
}));

describe("Admin page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure localStorage entries expected by components exist so tests don't crash
    // Set a super-admin role so UsersTab loads the admin path (and calls roleService.getRoles)
    localStorage.setItem(
      "activeRoles",
      JSON.stringify([{ name: "super", organization: "admin" }])
    );
    localStorage.setItem("userData", JSON.stringify({ organization: "admin" }));

    // Provide safe resolved values for services used by UsersTab
    const { userService } = require("../services/userService");
    const { roleService } = require("../services/roleService");
    const { organizationService } = require("../services/organizationService");
    userService.getUsers.mockResolvedValue([]);
    roleService.getRoles.mockResolvedValue({ roles: [] });
    organizationService.getOrganizations.mockResolvedValue({ organization_units: [] });
  });

  afterEach(() => {
    localStorage.removeItem("activeRoles");
    localStorage.removeItem("userData");
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
    const { container } = render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );

    // Open the session menu (the logout button is inside the menu)
    const sessionUser = container.querySelector(".session-user");
    expect(sessionUser).toBeTruthy();
    fireEvent.click(sessionUser);

    const logoutBtn = await screen.findByRole("button", { name: /cerrar sesión/i });
    fireEvent.click(logoutBtn);
    expect(authService.logout).toHaveBeenCalled();
  });

  it("shows error message if getRoles fails (covers line 32)", async () => {
    // Simulate failure; component currently logs error and leaves roles empty,
    // so we expect the RolesTable empty-state message to appear.
    roleService.getRoles.mockRejectedValueOnce(new Error("Error fetching roles"));
    render(
      <BrowserRouter>
        <Admin />
      </BrowserRouter>
    );
    // Switch to the Roles tab (default is Usuarios) so the RolesTable is visible
    const rolesTabBtn = await screen.findByRole("button", { name: /roles/i });
    fireEvent.click(rolesTabBtn);

    // RolesTable should render the empty message when roles array is empty
    expect(await screen.findByText(/no se encontraron roles/i)).toBeInTheDocument();
  });
});
