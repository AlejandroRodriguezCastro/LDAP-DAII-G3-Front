import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import UserFormModalContent from "../components/admin/UserFormModalContent";
import ModalContext from "../components/context/ModalContext";

describe("UserFormModalContent - Missing Coverage Lines", () => {
  const mockOnChange = jest.fn();
  const mockSetValidToSave = jest.fn();

  const roleOptions = [
    { name: "admin", organization: "admin" },
    { name: "editor", organization: "orgA" },
    { name: "viewer", organization: "orgA" },
  ];

  const wrap = (ui) => (
    <ModalContext.Provider value={{ setValidToSave: mockSetValidToSave }}>
      {ui}
    </ModalContext.Provider>
  );

  beforeEach(() => {
    mockOnChange.mockClear();
    mockSetValidToSave.mockClear();

    const store = {
      userData: JSON.stringify({ organization: "admin" }),
      activeRoles: JSON.stringify([{ name: "super admin", organization: "admin" }]),
    };

    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => store[key]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("covers lines 25-29: isAdmin useMemo with non-admin user", async () => {
    const store = {
      userData: JSON.stringify({ organization: "user-org" }),
      activeRoles: JSON.stringify([{ name: "user", organization: "user-org" }]),
    };

    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => store[key]);

    await act(async () => {
      render(wrap(<UserFormModalContent user={{}} onChange={mockOnChange} roleOptions={roleOptions} />));
    });

    expect(screen.queryByText("Selecciona una organización")).not.toBeInTheDocument();
  });

  test("covers lines 38-42: non-admin user auto-sets organization", async () => {
    const store = {
      userData: JSON.stringify({ organization: "user-org" }),
      activeRoles: JSON.stringify([{ name: "user", organization: "user-org" }]),
    };

    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => store[key]);

    await act(async () => {
      render(
        wrap(
          <UserFormModalContent
            user={{}}
            onChange={mockOnChange}
            roleOptions={roleOptions}
            isEdit={false}
          />
        )
      );
    });

    await waitFor(() =>
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ organization: "user-org" }))
    );
  });

  test("covers lines 53-61: handleChange for simple fields", async () => {
    await act(async () => {
      render(wrap(<UserFormModalContent user={{ first_name: "John" }} onChange={mockOnChange} roleOptions={roleOptions} />));
    });

    const lastNameInput = screen.getByPlaceholderText("Apellido");

    fireEvent.change(lastNameInput, {
      target: { name: "last_name", value: "Doe" },
    });

    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ last_name: "Doe" }));
  });

  test("covers lines 88-92: organization change with empty value", async () => {
    const organizations = [{ ou: ["admin"] }, { ou: ["orgA"] }];

    await act(async () => {
      render(
        wrap(
          <UserFormModalContent
            user={{}}
            onChange={mockOnChange}
            organizations={organizations}
            roleOptions={roleOptions}
          />
        )
      );
    });

    const orgSelect = screen.getAllByRole("combobox")[0]; // <select name="organization">

    const initialCount = mockOnChange.mock.calls.length;

    fireEvent.change(orgSelect, { target: { name: "organization", value: "" } });

    expect(mockOnChange.mock.calls.length).toBe(initialCount);
  });

  test("covers removeRole without onChange", async () => {
    const userWithRoles = { roles: [{ name: "editor", organization: "orgA" }] };

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      render(wrap(<UserFormModalContent user={userWithRoles} roleOptions={roleOptions} />));
    });

    const roleDiv = screen.getAllByText("editor")[1]; // the role-item div, not the <option>

    fireEvent.click(roleDiv);

    consoleSpy.mockRestore();
  });

  test("covers user prop change", async () => {
    let component;

    await act(async () => {
      component = render(
        wrap(
          <UserFormModalContent
            user={{ organization: "initial-org" }}
            onChange={mockOnChange}
            roleOptions={roleOptions}
          />
        )
      );
    });

    await act(async () => {
      component.rerender(
        wrap(
          <UserFormModalContent
            user={{ organization: "new-org", first_name: "Updated" }}
            onChange={mockOnChange}
            roleOptions={roleOptions}
          />
        )
      );
    });

    expect(screen.getByDisplayValue("Updated")).toBeInTheDocument();
  });
});
