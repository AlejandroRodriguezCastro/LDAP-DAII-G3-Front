import { render, screen } from "@testing-library/react";
import FormInput from "../components/FormInput";

describe("FormInput component", () => {
  it("renders correctly with label and placeholder", () => {
    render(<FormInput id="nombre" label="Nombre" placeholder="Ingresar nombre" />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  it("renders error message when error prop has message", () => {
    const error = { message: "Campo requerido" };
    render(<FormInput id="email" label="Email" error={error} />);
    expect(screen.getByText("Campo requerido")).toBeInTheDocument();
  });

  it("does not render error element when error is undefined", () => {
    render(<FormInput id="user" label="User" />);
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders even if register prop is missing (covers line 5)", () => {
    render(<FormInput id="no-register" label="Sin register" type="text" />);
    expect(screen.getByLabelText("Sin register")).toBeInTheDocument();
  });
});
