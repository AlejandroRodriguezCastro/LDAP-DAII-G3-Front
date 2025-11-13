import { render, screen, fireEvent } from "@testing-library/react";
import UsersTable from "../components/admin/UsersTable";

describe("UsersTable", () => {
  const mockUsers = [
    {
      id: 1,
      first_name: "Juan",
      last_name: "Perez",
      mail: "juan@test.com",
      organization: "IT",
      roles: [{ name: "Admin" }],
    },
    {
      id: 2,
      first_name: "Maria",
      last_name: "Lopez",
      mail: "maria@test.com",
      organization: "HR",
      roles: [{ name: "User" }],
    },
  ];

  const defaultProps = {
    users: mockUsers,
    handleEdit: jest.fn(),
    handleDelete: jest.fn(),
  };

  test("renders users table with correct user info", () => {
    render(<UsersTable {...defaultProps} />);

    // Verifica contenido
    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByText("maria@test.com")).toBeInTheDocument();

    // Verifica roles
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  test("calls handleEdit when clicking edit icon", () => {
    render(<UsersTable {...defaultProps} />);

    // "edit" es el texto interno del span
    fireEvent.click(screen.getAllByText("edit")[0]);

    expect(defaultProps.handleEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  test("calls handleDelete when clicking delete icon", () => {
    render(<UsersTable {...defaultProps} />);

    // "delete" es el texto interno del span
    fireEvent.click(screen.getAllByText("delete")[1]);

    expect(defaultProps.handleDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleDelete).toHaveBeenCalledWith(mockUsers[1]);
  });

  test("renders message when no users", () => {
    render(<UsersTable users={[]} />);

    expect(
      screen.getByText("No se encontraron usuarios.")
    ).toBeInTheDocument();
  });
});
