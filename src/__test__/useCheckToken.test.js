import { renderHook, act } from "@testing-library/react";
import { useCheckToken } from "../components/hooks/checkToken";
import { authService } from "../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Mock toast
jest.mock("react-toastify", () => ({
  toast: { info: jest.fn() }
}));

// Mock navigate
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn()
}));

// Mock authService
jest.mock("../services/authService", () => ({
  authService: {
    getToken: jest.fn(),
    validateToken: jest.fn()
  }
}));

describe("useCheckToken basic coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useNavigate.mockReturnValue(jest.fn()); // no-op navigate
  });

  it("retorna tokenValid true cuando token es válido", async () => {
    authService.getToken.mockReturnValue("123");
    authService.validateToken.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCheckToken());
    const checkToken = result.current;

    const res = await act(() => checkToken());

    expect(authService.validateToken).toHaveBeenCalled();
    expect(res.tokenValid).toBe(true);
  });

  it("muestra toast y no rompe cuando token NO es válido", async () => {
    authService.getToken.mockReturnValue("123");
    authService.validateToken.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useCheckToken());
    const checkToken = result.current;

    await act(() => checkToken());

    expect(toast.info).toHaveBeenCalled();
    expect(authService.validateToken).toHaveBeenCalled();
  });
});
