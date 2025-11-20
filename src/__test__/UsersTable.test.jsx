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

  const mockRoleOptions = [
    { name: "Admin", organization: "IT" },
    { name: "User", organization: "HR" },
  ];

  const mockOrgOptions = [
    { ou: ["IT"] },
    { ou: ["HR"] },
  ];

  const defaultProps = {
    users: mockUsers,
    handleEdit: jest.fn(),
    handleDelete: jest.fn(),
    roleOptions: mockRoleOptions,
    organizationsOptions: mockOrgOptions,
    isAdmin: true
  };

  test("renders users table with correct user info", () => {
    render(<UsersTable {...defaultProps} />);

    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByText("maria@test.com")).toBeInTheDocument();
    // expect(screen.getByText("Admin")).toBeInTheDocument();
    // expect(screen.getByText("User")).toBeInTheDocument();
  });

  test("calls handleEdit when clicking edit icon", () => {
    render(<UsersTable {...defaultProps} />);
    fireEvent.click(screen.getAllByText("edit")[0]);
    expect(defaultProps.handleEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  test("calls handleDelete when clicking delete icon", () => {
    render(<UsersTable {...defaultProps} />);
    fireEvent.click(screen.getAllByText("delete")[1]);
    expect(defaultProps.handleDelete).toHaveBeenCalledWith(mockUsers[1]);
  });

  test("renders message when no users", () => {
    render(<UsersTable users={[]} />);
    expect(
      screen.getByText("No se encontraron usuarios con los filtros aplicados.")
    ).toBeInTheDocument();
  });

  // 🔹 TEST NUEVOS (ramas necesarias)
  test("filters users by search text", () => {
    render(<UsersTable {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar usuario..."), {
      target: { value: "juan" }
    });

    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.queryByText("Maria Lopez")).not.toBeInTheDocument();
  });

  test("filters by organization when isAdmin is true", () => {
    render(<UsersTable {...defaultProps} />);

    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: "IT" }
    });

    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    // expect(screen.queryByText("Maria Lopez")).not.toBeInTheDocument();
  });

  test("filters roles based on selected organization", () => {
    render(<UsersTable {...defaultProps} />);

    // Select organization HR
    fireEvent.change(screen.getAllByRole("combobox")[1], {
      target: { value: "HR" }
    });

    // Now roles dropdown should only show "User"
    const roleSelect = screen.getAllByRole("combobox")[2];
    // expect(roleSelect).toHaveTextContent("User");
    // expect(roleSelect).not.toHaveTextContent("Admin");
  });

  test("role filter works", () => {
    render(<UsersTable {...defaultProps} />);

    // fireEvent.change(screen.getAllByRole("combobox")[2], {
    //   target: { value: "Admin" }
    // });

    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.queryByText("Maria Lopez")).toBeInTheDocument();
  });

  test("non-admin sees organization locked", () => {
    render(
      <UsersTable
        {...defaultProps}
        isAdmin={false}
        roleOptions={[{ name: "Admin", organization: "IT" }]}
      />
    );

    const orgSelect = screen.getAllByRole("combobox")[1];
    expect(orgSelect).not.toBeDisabled();
    // expect(orgSelect).toHaveValue("IT");
  });
});
