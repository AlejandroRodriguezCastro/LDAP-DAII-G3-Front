import * as Yup from "yup";

export const roleSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(30, "El nombre no puede tener más de 30 caracteres")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s_.-]+$/,
      "El nombre solo puede contener letras, espacios, guiones, puntos o guiones bajos"
    )
    .required("El nombre es obligatorio"),

  description: Yup.string()
    .trim()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s,.;:()'"¡!¿?%_\-.]*$/,
      "La descripción contiene caracteres no permitidos"
    )
    .required("La descripción es obligatoria"),

  organization: Yup.string()
    .trim()
    .min(5, "La organización debe tener al menos 5 caracteres")
    .max(30, "La organización no puede tener más de 30 caracteres")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s_.-]+$/,
      "La organización contiene caracteres no permitidos"
    )
    .required("La organización es obligatoria"),
});
