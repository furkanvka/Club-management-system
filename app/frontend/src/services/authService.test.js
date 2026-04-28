import { authService } from './authService';
import api from './api';

// Mock the api module
jest.mock('./api');

describe('authService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call api.post and store token and loginType on success', async () => {
      const mockToken = 'header.' + btoa(JSON.stringify({ role: 'ROLE_USER' })) + '.signature';
      const mockResponse = { data: { accessToken: mockToken } };
      api.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@test.com', password: 'password123' };
      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('loginType')).toBe('user');
    });

    it('should set loginType to admin if role is ROLE_ADMIN', async () => {
      const mockToken = 'header.' + btoa(JSON.stringify({ role: 'ROLE_ADMIN' })) + '.signature';
      const mockResponse = { data: { accessToken: mockToken } };
      api.post.mockResolvedValue(mockResponse);

      await authService.login({ email: 'admin@admin.com', password: 'password123' });

      expect(localStorage.getItem('loginType')).toBe('admin');
    });
  });

  describe('clubLogin', () => {
    it('should call api.post and store token and club loginType on success', async () => {
      const mockResponse = { data: { accessToken: 'mocked-token' } };
      api.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'club@test.com', password: 'password123' };
      const result = await authService.clubLogin(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/club-login', credentials);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('mocked-token');
      expect(localStorage.getItem('loginType')).toBe('club');
    });
  });

  describe('register', () => {
    it('should call api.post with user data', async () => {
      const mockResponse = { data: { id: 1, email: 'new@test.com' } };
      api.post.mockResolvedValue(mockResponse);

      const userData = { email: 'new@test.com', password: 'password' };
      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    it('should clear all auth related items from localStorage', () => {
      localStorage.setItem('token', 'token');
      localStorage.setItem('loginType', 'user');
      localStorage.setItem('activeClub', 'club1');
      localStorage.setItem('activeRole', 'member');
      localStorage.setItem('activeMembershipId', '1');

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('loginType')).toBeNull();
      expect(localStorage.getItem('activeClub')).toBeNull();
      expect(localStorage.getItem('activeRole')).toBeNull();
      expect(localStorage.getItem('activeMembershipId')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null if no token is in localStorage', () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return decoded token payload and loginType', () => {
      const payload = { sub: 'test@test.com', role: 'ROLE_USER' };
      const mockToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('loginType', 'user');

      const result = authService.getCurrentUser();

      expect(result).toEqual({ ...payload, loginType: 'user' });
    });

    it('should return null if token is invalid', () => {
      localStorage.setItem('token', 'invalid-token');
      
      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
