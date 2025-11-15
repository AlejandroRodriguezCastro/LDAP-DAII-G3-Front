import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

export const useCheckToken = () => {
  const navigate = useNavigate();

  const checkToken = async () => {
    const response = await authService.validateToken(authService.getToken());

    if (!response.success) {
      toast.info(
        "El token no es válido o expiró, será redirigido al login en unos segundos...",
        { position: "bottom-right", autoClose: 3000, theme: "light" }
      );

      setTimeout(() => {
        localStorage.clear();
        navigate("/");
      }, 3000);
    }

    return { tokenValid: true};
  };

  return checkToken;
};
