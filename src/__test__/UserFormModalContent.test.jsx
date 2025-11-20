import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import UserFormModalContent from "../components/admin/UserFormModalContent";
import ModalContext from "../components/context/ModalContext";

// Mock the validation schema to avoid async issues
jest.mock("../components/admin/validationSchemas/userSchema", () => ({
  userSchema: {
    validate: jest.fn().mockImplementation((data, options) => {
      return new Promise((resolve, reject) => {
        const errors = [];
        
        // Simple synchronous validation for testing
        if (!data.first_name || data.first_name.trim() === "") {
          errors.push({ path: "first_name", message: "Nombre es requerido" });
        }
        if (!data.last_name || data.last_name.trim() === "") {
          errors.push({ path: "last_name", message: "Apellido es requerido" });
        }
        if (!data.mail || !/\S+@\S+\.\S+/.test(data.mail)) {
          errors.push({ path: "mail", message: "Debe ser un email válido" });
        }
        if (!data.organization || data.organization.trim() === "") {
          errors.push({ path: "organization", message: "Organización es requerida" });
        }
        if (!data.roles || data.roles.length === 0) {
          errors.push({ path: "roles", message: "Al menos un rol es requerido" });
        }

        if (errors.length > 0) {
          reject({ 
            inner: errors,
            name: "ValidationError" 
          });
        } else {
          resolve(data);
        }
      });
    })
  }
}));

describe("UserFormModalContent - Missing Coverage Lines", () => {
  const mockOnChange = jest.fn();
  const mockSetValidToSave = jest.fn();

  const roleOptions = [
    { name: "admin", organization: "admin" },
    { name: "editor", organization: "orgA" },
    { name: "viewer", organization: "orgA" },
  ];

  const organizations = [
    { ou: ["admin"] },
    { ou: ["orgA"] },
    { ou: ["orgB"] }
  ];

  const wrap = (ui) => (
    <ModalContext.Provider value={{ setValidToSave: mockSetValidToSave }}>
      {ui}
    </ModalContext.Provider>
  );

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnChange.mockClear();
    mockSetValidToSave.mockClear();

    const store = {
      userData: JSON.stringify({ organization: "admin" }),
      activeRoles: JSON.stringify([{ name: "super admin", organization: "admin" }]),
    };

    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => store[key]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Password Validation Tests
  describe("Password Validation", () => {
    test("covers lines 103-149: password validation with various scenarios", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ mail: "test@example.com", first_name: "Test", last_name: "User", organization: "admin", roles: [] }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              isEdit={true}
            />
          )
        );
      });

      const newPasswordInput = screen.getByPlaceholderText("Nueva Contraseña");
      
      // Test password too short
      await act(async () => {
        fireEvent.change(newPasswordInput, { target: { name: "newPassword", value: "short" } });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText("La contraseña debe tener al menos 12 caracteres")).toBeInTheDocument();
      });

      // Test password without special character
      await act(async () => {
        fireEvent.change(newPasswordInput, { target: { name: "newPassword", value: "longpasswordwithout" } });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText("La contraseña debe contener al menos un carácter especial")).toBeInTheDocument();
      });

      // Test valid password
      await act(async () => {
        fireEvent.change(newPasswordInput, { target: { name: "newPassword", value: "validPassword123!" } });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText("La contraseña debe tener al menos 12 caracteres")).not.toBeInTheDocument();
        expect(screen.queryByText("La contraseña debe contener al menos un carácter especial")).not.toBeInTheDocument();
      });
    });

    test("covers lines 159: new password cannot be same as current password", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ mail: "test@example.com", first_name: "Test", last_name: "User", organization: "admin", roles: [] }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              isEdit={true}
            />
          )
        );
      });

      const currentPasswordInput = screen.getByPlaceholderText("Contraseña Actual");
      const newPasswordInput = screen.getByPlaceholderText("Nueva Contraseña");

      // Set current password
      await act(async () => {
        fireEvent.change(currentPasswordInput, { 
          target: { name: "currentPassword", value: "samePassword123!" } 
        });
        jest.advanceTimersByTime(100);
      });

      // Try to set new password same as current
      await act(async () => {
        fireEvent.change(newPasswordInput, { 
          target: { name: "newPassword", value: "samePassword123!" } 
        });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText("La nueva contraseña no puede ser igual a la contraseña actual")).toBeInTheDocument();
      });
    });

    test("covers lines 170-176: password confirmation validation", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ mail: "test@example.com", first_name: "Test", last_name: "User", organization: "admin", roles: [] }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              isEdit={true}
            />
          )
        );
      });

      const newPasswordInput = screen.getByPlaceholderText("Nueva Contraseña");
      const confirmPasswordInput = screen.getByPlaceholderText("Confirmar Nueva Contraseña");

      // Set new password
      await act(async () => {
        fireEvent.change(newPasswordInput, { 
          target: { name: "newPassword", value: "validPassword123!" } 
        });
        jest.advanceTimersByTime(100);
      });

      // Set different confirm password
      await act(async () => {
        fireEvent.change(confirmPasswordInput, { 
          target: { name: "confirmPassword", value: "differentPassword123!" } 
        });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
      });

      // Fix confirm password
      await act(async () => {
        fireEvent.change(confirmPasswordInput, { 
          target: { name: "confirmPassword", value: "validPassword123!" } 
        });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByText("Las contraseñas no coinciden")).not.toBeInTheDocument();
      });
    });
  });

  // Form Validation and Error Handling
  describe("Form Validation and Error States", () => {
    test("covers lines 69-70: form validation on mount with valid data", async () => {
      const validUser = {
        first_name: "John",
        last_name: "Doe",
        mail: "john@example.com",
        organization: "admin",
        roles: [{ name: "admin", organization: "admin" }]
      };

      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={validUser}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              organizations={organizations}
            />
          )
        );
      });

      await waitFor(() => {
        expect(mockSetValidToSave).toHaveBeenCalledWith(true);
      });
    });

    test("covers lines 69-70: form validation on mount with invalid data", async () => {
      const invalidUser = {
        first_name: "",
        last_name: "",
        mail: "invalid-email",
        organization: "",
        roles: []
      };

      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={invalidUser}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              organizations={organizations}
            />
          )
        );
      });

      await waitFor(() => {
        expect(mockSetValidToSave).toHaveBeenCalledWith(false);
      });

      // Check that specific error messages are displayed
      await waitFor(() => {
        expect(screen.getByText("Nombre es requerido")).toBeInTheDocument();
        expect(screen.getByText("Apellido es requerido")).toBeInTheDocument();
      });
    });

    test("covers password visibility toggle", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ mail: "test@example.com", first_name: "Test", last_name: "User", organization: "admin", roles: [] }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              isEdit={true}
            />
          )
        );
      });

      const currentPasswordInput = screen.getByPlaceholderText("Contraseña Actual");
      const toggleButtons = screen.getAllByText("Mostrar");

      // Initially should be password type
      expect(currentPasswordInput.type).toBe("password");

      // Toggle current password visibility
      await act(async () => {
        fireEvent.click(toggleButtons[0]);
      });

      expect(currentPasswordInput.type).toBe("text");
      expect(screen.getAllByText("Ocultar")[0]).toBeInTheDocument();

      // Toggle back
      await act(async () => {
        fireEvent.click(toggleButtons[0]);
      });

      expect(currentPasswordInput.type).toBe("password");
    });
  });

  // Edge Cases and Error Scenarios
  describe("Edge Cases", () => {
    test("covers validation schema errors with proper async handling", async () => {
      const invalidUser = {
        first_name: "", // Required field empty
        last_name: "", // Required field empty  
        mail: "invalid-email", // Invalid email format
        organization: "", // Required field empty
        roles: [] // Required field empty
      };

      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={invalidUser}
              onChange={mockOnChange}
              organizations={organizations}
              roleOptions={roleOptions}
            />
          )
        );
      });

      // Wait for validation to complete
      await waitFor(() => {
        expect(mockSetValidToSave).toHaveBeenCalledWith(false);
      });

      // Check that error messages are displayed
      await waitFor(() => {
        const errorElements = screen.getAllByText(/es requerido|válido/i);
        expect(errorElements.length).toBeGreaterThanOrEqual(3);
      });
    }, 10000); // Increase timeout for this test

    test("covers empty password validation returns null", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ mail: "test@example.com", first_name: "Test", last_name: "User", organization: "admin", roles: [] }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              isEdit={true}
            />
          )
        );
      });

      const newPasswordInput = screen.getByPlaceholderText("Nueva Contraseña");

      // Test empty password
      await act(async () => {
        fireEvent.change(newPasswordInput, { target: { name: "newPassword", value: "" } });
        jest.advanceTimersByTime(100);
      });
      
      // Should not show any error for empty password
      await waitFor(() => {
        expect(screen.queryByText("La contraseña debe tener al menos 12 caracteres")).not.toBeInTheDocument();
        expect(screen.queryByText("La contraseña debe contener al menos un carácter especial")).not.toBeInTheDocument();
      });
    });

    test("covers onChange callback with password fields", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ mail: "test@example.com", first_name: "Test", last_name: "User", organization: "admin", roles: [] }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              isEdit={true}
            />
          )
        );
      });

      const currentPasswordInput = screen.getByPlaceholderText("Contraseña Actual");

      await act(async () => {
        fireEvent.change(currentPasswordInput, { 
          target: { name: "currentPassword", value: "testPassword123!" } 
        });
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            _currentPassword: "testPassword123!",
            mail: "test@example.com"
          })
        );
      });
    });
  });

  // Role and Organization Tests
  describe("Role and Organization Management", () => {
    test("covers role selection and removal", async () => {
      const userWithRoles = { 
        first_name: "Test",
        last_name: "User", 
        mail: "test@example.com",
        organization: "orgA",
        roles: [{ name: "editor", organization: "orgA" }, { name: "viewer", organization: "orgA" }] 
      };

      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={userWithRoles}
              onChange={mockOnChange}
              roleOptions={roleOptions}
              organizations={organizations}
            />
          )
        );
      });

      // Test removing a role
      const roleItems = screen.getAllByText("editor");
      const roleItem = roleItems.find(element => 
        element.className?.includes?.('role-item') || 
        element.getAttribute('class')?.includes?.('role-item')
      ) || roleItems[1]; // Fallback to second element

      await act(async () => {
        fireEvent.click(roleItem);
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: expect.arrayContaining([
              expect.objectContaining({ name: "viewer" })
            ])
          })
        );
      });
    });

    test("covers empty roles display", async () => {
      await act(async () => {
        render(
          wrap(
            <UserFormModalContent
              user={{ roles: [], first_name: "Test", last_name: "User", mail: "test@example.com", organization: "admin" }}
              onChange={mockOnChange}
              roleOptions={roleOptions}
            />
          )
        );
      });

      expect(screen.getByText("No hay roles seleccionados todavía")).toBeInTheDocument();
    });
  });
});