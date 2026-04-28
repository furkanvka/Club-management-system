import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
import { useAuth } from '../../store/AuthContext';

// Mock the hooks
jest.mock('../../store/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}), { virtual: true });

describe('Login Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: mockLogin });
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form elements', () => {
    renderLogin();

    expect(screen.getByText('Tekrar Hoş Geldiniz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ornek@universite.edu.tr')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Giriş Yap/i })[0]).toBeInTheDocument();
  });

  it('updates input values on change', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('ornek@universite.edu.tr');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login function and navigates on successful standard login', async () => {
    mockLogin.mockResolvedValue({ role: 'ROLE_USER' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('ornek@universite.edu.tr'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    const form = screen.getByPlaceholderText('ornek@universite.edu.tr').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
      expect(mockNavigate).toHaveBeenCalledWith('/select-club');
    });
  });

  it('calls login function and navigates on successful admin login', async () => {
    mockLogin.mockResolvedValue({ role: 'ROLE_ADMIN' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('ornek@universite.edu.tr'), { target: { value: 'admin@admin.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin123' } });
    
    const form = screen.getByPlaceholderText('ornek@universite.edu.tr').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'admin@admin.com', password: 'admin123' });
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('displays error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'));
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('ornek@universite.edu.tr'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    
    const form = screen.getByPlaceholderText('ornek@universite.edu.tr').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')).toBeInTheDocument();
    });
  });
});
