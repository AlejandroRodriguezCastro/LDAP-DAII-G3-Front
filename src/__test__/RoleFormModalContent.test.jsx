// components/__tests__/RoleFormModalContent.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RoleFormModalContent from "../components/admin/RoleFormModalContent";
import ModalContext from "../components/context/ModalContext";
import { roleSchema } from "../components/admin/validationSchemas/roleSchema";

jest.mock("../components/admin/validationSchemas/roleSchema", () => ({
  roleSchema: {
    validate: jest.fn(),
  },
}));

const mockSetValidToSave = jest.fn();

const renderWithContext = (props) => {
  return render(
    <ModalContext.Provider value={{ setValidToSave: mockSetValidToSave }}>
      <RoleFormModalContent {...props} />
    </ModalContext.Provider>
  );
};

describe("RoleFormModalContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza el título si existe", () => {
    roleSchema.validate.mockResolvedValueOnce({});

    renderWithContext({
      title: "Crear Rol",
      role: {},
      isAdmin: true,
      onChange: jest.fn(),
      organizations: [],
    });

    expect(screen.getByText("Crear Rol")).toBeInTheDocument();
  });

  test("renderiza inputs básicos", () => {
    roleSchema.validate.mockResolvedValueOnce({});

    renderWithContext({
      title: "",
      role: {},
      isAdmin: false,
      onChange: jest.fn(),
      organizations: [],
    });

    expect(screen.getByPlaceholderText("Nombre del rol")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Descripción")).toBeInTheDocument();
  });

  test("llama onChange cuando el usuario escribe", () => {
    roleSchema.validate.mockResolvedValue({});

    const mockOnChange = jest.fn();

    renderWithContext({
      title: "",
      role: {},
      isAdmin: false,
      onChange: mockOnChange,
      organizations: [],
    });

    const input = screen.getByPlaceholderText("Nombre del rol");
    fireEvent.change(input, { target: { name: "name", value: "Admin" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      name: "Admin",
      description: "",
      organization: "",
    });
  });

  test("si es admin, muestra el select de organizaciones", () => {
    roleSchema.validate.mockResolvedValue({});

    const orgs = [{ ou: ["Org1"] }, { ou: ["Org2"] }];

    renderWithContext({
      title: "",
      role: {},
      isAdmin: true,
      organizations: orgs,
      onChange: jest.fn(),
    });

    expect(screen.getByText("Selecciona una organización")).toBeInTheDocument();
    expect(screen.getByText("Org1")).toBeInTheDocument();
    expect(screen.getByText("Org2")).toBeInTheDocument();
  });

  test("si NO es admin, muestra un input disabled", () => {
    roleSchema.validate.mockResolvedValue({});

    renderWithContext({
      title: "",
      role: {},
      isAdmin: false,
      organizations: [],
      onChange: jest.fn(),
    });

    const orgInput = screen.getByPlaceholderText("Organización");
    expect(orgInput).toBeDisabled();
  });

  test("setValidToSave(true) cuando validate pasa", async () => {
    roleSchema.validate.mockResolvedValueOnce({});

    renderWithContext({
      title: "",
      role: { name: "A" },
      isAdmin: true,
      organizations: [],
      onChange: jest.fn(),
    });

    await waitFor(() => {
      expect(mockSetValidToSave).toHaveBeenCalledWith(true);
    });
  });

  test("muestra errores cuando la validación falla", async () => {
    roleSchema.validate.mockRejectedValue({
      inner: [
        { path: "name", message: "Nombre requerido" },
        { path: "description", message: "Descripción requerida" },
      ],
    });

    renderWithContext({
      title: "",
      role: {},
      isAdmin: true,
      organizations: [],
      onChange: jest.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText("Nombre requerido")).toBeInTheDocument();
      expect(screen.getByText("Descripción requerida")).toBeInTheDocument();
      expect(mockSetValidToSave).toHaveBeenCalledWith(false);
    });
  });

  test("actualiza el form cuando cambian las props role", async () => {
    roleSchema.validate.mockResolvedValue({});

    const { rerender } = render(
      <ModalContext.Provider value={{ setValidToSave: mockSetValidToSave }}>
        <RoleFormModalContent
          title=""
          isAdmin={true}
          role={{ name: "Inicial" }}
          organizations={[]}
          onChange={jest.fn()}
        />
      </ModalContext.Provider>
    );

    expect(screen.getByPlaceholderText("Nombre del rol").value).toBe("Inicial");

    rerender(
      <ModalContext.Provider value={{ setValidToSave: mockSetValidToSave }}>
        <RoleFormModalContent
          title=""
          isAdmin={true}
          role={{ name: "Modificado" }}
          organizations={[]}
          onChange={jest.fn()}
        />
      </ModalContext.Provider>
    );

    expect(screen.getByPlaceholderText("Nombre del rol").value).toBe("Modificado");
  });
});
