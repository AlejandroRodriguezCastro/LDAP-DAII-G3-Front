import * as Yup from "yup";

export const userSchema = Yup.object().shape({
  first_name: Yup.string()
    .trim()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(30, "El nombre no puede tener más de 30 caracteres")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'.-_]+$/,
      "El nombre solo puede contener letras, espacios, puntos o guiones"
    )
    .required("El nombre es obligatorio"),

  last_name: Yup.string()
    .trim()
    .min(5, "El apellido debe tener al menos 5 caracteres")
    .max(30, "El apellido no puede tener más de 30 caracteres")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'.-]+$/,
      "El apellido solo puede contener letras, espacios, puntos o guiones"
    )
    .required("El apellido es obligatorio"),

  mail: Yup.string()
    .trim()
    .email("Debe ser un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),

  organization: Yup.string()
    .trim()
    .min(5, "La organización debe tener al menos 5 caracteres")
    .max(50, "La organización no puede tener más de 50 caracteres")
    .matches(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s_.-]+$/,
      "La organización contiene caracteres no permitidos"
    )
    .required("La organización es obligatoria"),

  roles: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required(),
      })
    )
    .min(1, "Debe seleccionar al menos un rol")
    .required("Debe seleccionar al menos un rol"),
});
