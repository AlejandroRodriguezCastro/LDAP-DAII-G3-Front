import { render, screen, fireEvent } from "@testing-library/react";
import UsersTable from "../components/admin/UsersTable";

describe("UsersTable", () => {
  const mockUsers = [
    { id: 1, name: "Juan", email: "juan@test.com" },
    { id: 2, name: "Maria", email: "maria@test.com" },
  ];

  const defaultProps = {
    users: mockUsers,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  test("renders users table", () => {
    render(<UsersTable {...defaultProps} />);
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("maria@test.com")).toBeInTheDocument();
  });

  test("calls onEdit when edit clicked", () => {
    render(<UsersTable {...defaultProps} />);
    fireEvent.click(screen.getAllByText(/editar/i)[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  test("calls onDelete when delete clicked", () => {
    render(<UsersTable {...defaultProps} />);
    fireEvent.click(screen.getAllByText(/eliminar/i)[1]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockUsers[1]);
  });
});
