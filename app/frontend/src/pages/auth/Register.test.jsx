import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Register } from './Register';
import { authService } from '../../services/authService';

// Mock authService
jest.mock('../../services/authService', () => ({
  authService: {
    register: jest.fn()
  }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}), { virtual: true });

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn(); // Mock window.alert
  });

  const renderRegister = () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('renders register form elements', () => {
    renderRegister();

    expect(screen.getByText('Yeni Hesap Oluştur')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ahmet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Yılmaz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('202101001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ornek@universite.edu.tr')).toBeInTheDocument();
    // Two password fields
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Hesabımı Oluştur' })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Ahmet'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Yılmaz'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('202101001'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('ornek@universite.edu.tr'), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'differentpassword' } });

    const form = screen.getByPlaceholderText('ornek@universite.edu.tr').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Şifreler eşleşmiyor.')).toBeInTheDocument();
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  it('calls register function and navigates on successful registration', async () => {
    authService.register.mockResolvedValue({});
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Ahmet'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Yılmaz'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('202101001'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('ornek@universite.edu.tr'), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    const form = screen.getByPlaceholderText('ornek@universite.edu.tr').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        studentNumber: '123',
        email: 'test@test.com',
        password: 'password123'
      });
      expect(window.alert).toHaveBeenCalledWith('Kaydınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('displays error message on registration failure', async () => {
    authService.register.mockRejectedValue({
      response: { data: { message: 'Bu e-posta adresi zaten kullanımda!' } }
    });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('Ahmet'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Yılmaz'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('202101001'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('ornek@universite.edu.tr'), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    const form = screen.getByPlaceholderText('ornek@universite.edu.tr').closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Bu e-posta adresi zaten kullanımda!')).toBeInTheDocument();
    });
  });
});
