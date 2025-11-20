import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));
jest.mock('../services/userService', () => ({ userService: { getUser: jest.fn() } }));

describe('authService', () => {
  const ORIGINAL_FETCH = global.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = ORIGINAL_FETCH;
    localStorage.clear();
  });

  test('login success stores token and user data when not callback', async () => {
    const fakeToken = 'fake.jwt.token';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeToken,
    });

    jwtDecode.mockReturnValue({ email: 'user@example.com' });
    userService.getUser.mockResolvedValue({ roles: ['admin'], name: 'User' });

    const res = await authService.login({ email: 'a', password: 'b' }, false);

    expect(res.success).toBe(true);
    expect(res.token).toBe(fakeToken);
    expect(localStorage.getItem('authToken')).toBe(fakeToken);
    expect(localStorage.getItem('userData')).toBe(JSON.stringify({ roles: ['admin'], name: 'User' }));
  });

  test('login with isCallback true does not call userService.getUser', async () => {
    const fakeToken = 'fake.jwt.token';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeToken,
    });

    jwtDecode.mockReturnValue({ email: 'callback@example.com' });
    userService.getUser.mockResolvedValue({ roles: [] });

    const res = await authService.login({ email: 'a', password: 'b' }, true);
    expect(res.success).toBe(true);
    expect(userService.getUser).not.toHaveBeenCalled();
    // when isCallback=true we only store the token, not the decoded user
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('login throws when response not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    });

    await expect(authService.login({ email: 'x', password: 'y' })).rejects.toThrow();
  });

  test('validateToken success and failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await expect(authService.validateToken('t')).resolves.toEqual({ success: true });

    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const res = await authService.validateToken('t');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  test('register throws for duplicate email', async () => {
    await expect(authService.register({ email: 'test@citypass.com', password: 'p', name: 'n' })).rejects.toThrow('El email ya está registrado');
  });

  test('register success stores token and user', async () => {
    const res = await authService.register({ email: 'nuevo@test.com', password: 'p', name: 'Nombre' });
    expect(res.success).toBe(true);
    expect(res.token).toBeDefined();
    expect(localStorage.getItem('authToken')).toBe(res.token);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    expect(storedUser.email).toBe('nuevo@test.com');
  });

  test('recoverPassword success and failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    await expect(authService.recoverPassword('a@b.com')).resolves.toEqual({ ok: true });

    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Fail' }) });
    await expect(authService.recoverPassword('a@b.com')).rejects.toThrow('Fail');
  });

  test('resetPassword success and detailed error mapping', async () => {
    // success
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    await expect(authService.resetPassword('t', 'NewPass12345')).resolves.toEqual({ ok: true });

    // error with detail -> map to spanish message
    const errorPayload = {
      detail: [
        {
          type: 'string_too_short',
          loc: ['body', 'new_password'],
          msg: 'String should have at least 12 characters',
          input: '.Uade2025',
          ctx: { min_length: 12 }
        }
      ]
    };

    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => errorPayload });

    await expect(authService.resetPassword('t', '.Uade2025')).rejects.toThrow('La contraseña debe tener al menos 12 caracteres');
  });

  test('resetPassword when err.detail is string uses that message', async () => {
    const errorPayload = { detail: 'Some backend string error' };
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => errorPayload });
    await expect(authService.resetPassword('t', 'whatever')).rejects.toThrow('Some backend string error');
  });

  test('resetPassword when fetch rejects bubbles error (catch path)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network-fail'));
    await expect(authService.resetPassword('t', 'whatever')).rejects.toThrow('network-fail');
  });

  test('resetPassword when backend returns empty object uses default message', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(authService.resetPassword('t', 'x')).rejects.toThrow('No se pudo restablecer la contraseña');
  });

  test('resetPassword when backend returns { message } uses that message', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Custom error from backend' }) });
    await expect(authService.resetPassword('t', 'x')).rejects.toThrow('Custom error from backend');
  });
});
