package clubms.backend.service;

import clubms.backend.dto.request.LoginRequest;
import clubms.backend.dto.request.RegisterRequest;
import clubms.backend.entity.User;
import clubms.backend.repository.ClubRepository;
import clubms.backend.repository.UserRepository;
import clubms.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private ClubRepository clubRepository;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password123");

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("newuser@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setStudentNumber("123456789");
    }

    @Test
    void authenticateUser_Success() {
        when(userRepository.existsByEmail(loginRequest.getEmail())).thenReturn(true);
        
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
                
        when(tokenProvider.generateToken(authentication)).thenReturn("mocked-jwt-token");

        String token = authService.authenticateUser(loginRequest);

        assertEquals("mocked-jwt-token", token);
        verify(userRepository, times(1)).existsByEmail(loginRequest.getEmail());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider, times(1)).generateToken(authentication);
    }

    @Test
    void authenticateUser_UserNotFound() {
        when(userRepository.existsByEmail(loginRequest.getEmail())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticateUser(loginRequest);
        });

        assertEquals("Bu e-posta adresi ile kayıtlı bir öğrenci hesabı bulunamadı.", exception.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void authenticateClub_Success() {
        // Need to create a mock Club object or just return Optional.of(new Object) 
        // since we just check isEmpty()
        when(clubRepository.findByContactEmail(loginRequest.getEmail())).thenReturn(Optional.of(mock(clubms.backend.entity.Club.class)));
        
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
                
        when(tokenProvider.generateToken(authentication)).thenReturn("mocked-club-jwt-token");

        String token = authService.authenticateClub(loginRequest);

        assertEquals("mocked-club-jwt-token", token);
        verify(clubRepository, times(1)).findByContactEmail(loginRequest.getEmail());
    }

    @Test
    void authenticateClub_ClubNotFound() {
        when(clubRepository.findByContactEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticateClub(loginRequest);
        });

        assertEquals("Bu e-posta adresi ile kayıtlı bir kulüp hesabı bulunamadı.", exception.getMessage());
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void registerUser_Success() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        
        User savedUser = new User();
        savedUser.setEmail(registerRequest.getEmail());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.registerUser(registerRequest);

        assertNotNull(result);
        assertEquals(registerRequest.getEmail(), result.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_EmailAlreadyExists() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(registerRequest);
        });

        assertEquals("Bu e-posta adresi zaten kullanımda!", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
}
