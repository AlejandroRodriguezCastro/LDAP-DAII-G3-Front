// components/admin/__tests__/RolesTable.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RolesTable from "../components/admin/RolesTable";

describe("RolesTable", () => {
  const mockHandleDelete = jest.fn();
  const mockRoles = [
    { 
      id: 1, 
      name: "Admin", 
      description: "Administrator role", 
      organization: "admin",
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-20T14:45:00Z"
    },
    { 
      id: 2, 
      name: "User", 
      description: "Regular user", 
      organization: "org1",
      created_at: "2023-02-01T09:00:00Z",
      updated_at: "2023-02-01T09:00:00Z"
    }
  ];

  beforeEach(() => {
    mockHandleDelete.mockClear();
  });

  test("renders roles table with data", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Administrator role")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Regular user")).toBeInTheDocument();
    expect(screen.getByText("org1")).toBeInTheDocument();
  });

  test("shows empty message when no roles - line 5", () => {
    render(<RolesTable roles={[]} handleDelete={mockHandleDelete} />);
    
    expect(screen.getByText("No se encontraron roles.")).toBeInTheDocument();
  });

  test("shows empty message when roles is null - line 5", () => {
    render(<RolesTable roles={null} handleDelete={mockHandleDelete} />);
    
    expect(screen.getByText("No se encontraron roles.")).toBeInTheDocument();
  });

  test("shows empty message when roles is undefined - line 5", () => {
    render(<RolesTable roles={undefined} handleDelete={mockHandleDelete} />);
    
    expect(screen.getByText("No se encontraron roles.")).toBeInTheDocument();
  });

  test("handles delete button click - line 37", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    const deleteButtons = screen.getAllByText("delete");
    expect(deleteButtons).toHaveLength(2);
    
    fireEvent.click(deleteButtons[0]);
    
    expect(mockHandleDelete).toHaveBeenCalledWith(mockRoles[0]);
    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
  });

  test("formats dates correctly - line 12", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    // Las fechas deberían estar formateadas
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });



  test("handles roles without id by using name as key", () => {
    const rolesWithoutId = [
      { 
        name: "RoleWithoutId", 
        description: "No ID role", 
        organization: "test",
        created_at: "2023-01-01",
        updated_at: "2023-01-01"
      }
    ];

    render(<RolesTable roles={rolesWithoutId} handleDelete={mockHandleDelete} />);
    
    // Debería renderizar sin errores usando name como key
    expect(screen.getByText("RoleWithoutId")).toBeInTheDocument();
    expect(screen.getByText("No ID role")).toBeInTheDocument();
  });

  test("renders all table headers", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Organización")).toBeInTheDocument();
    expect(screen.getByText("Creado")).toBeInTheDocument();
    expect(screen.getByText("Actualizado")).toBeInTheDocument();
    expect(screen.getByLabelText("Acciones")).toBeInTheDocument();
  });

  test("renders correct number of rows", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    // +1 for header row
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(mockRoles.length + 1);
  });

  test("table has correct CSS classes", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    const table = screen.getByRole("table");
    expect(table).toHaveClass("users-table");
    expect(table).toHaveClass("roles-table");
  });

  test("action cells have correct class", () => {
    render(<RolesTable roles={mockRoles} handleDelete={mockHandleDelete} />);
    
    const actionCells = screen.getAllByRole("cell").filter(cell => 
      cell.classList.contains("action-cell")
    );
    expect(actionCells.length).toBe(mockRoles.length);
  });

  test("handles empty date fields", () => {
    const rolesWithEmptyDates = [
      { 
        id: 1, 
        name: "Test", 
        description: "Test role", 
        organization: "test",
        created_at: "",
        updated_at: null
      }
    ];

    render(<RolesTable roles={rolesWithEmptyDates} handleDelete={mockHandleDelete} />);
    
    // No debería haber errores con fechas vacías o null
    const emptyDateCells = screen.getAllByText("");
    expect(emptyDateCells.length).toBeGreaterThan(0);
  });
});