package clubms.backend.service;

import clubms.backend.dto.request.LoginRequest;
import clubms.backend.dto.request.RegisterRequest;
import clubms.backend.entity.User;
import clubms.backend.repository.UserRepository;
import clubms.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class AuthService {

    @PostConstruct
    public void init() {
        if (!userRepository.existsByEmail("admin@admin.com")) {
            User admin = new User();
            admin.setEmail("admin@admin.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123")); // Varsayılan şifre
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
        }
    }

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private clubms.backend.repository.ClubRepository clubRepository;

    public String authenticateUser(LoginRequest loginRequest) {
        // Strict Check: Must exist in users table
        if (!userRepository.existsByEmail(loginRequest.getEmail())) {
            throw new RuntimeException("Bu e-posta adresi ile kayıtlı bir öğrenci hesabı bulunamadı.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);
    }

    public String authenticateClub(LoginRequest loginRequest) {
        // Strict Check: Must exist in clubs table
        if (clubRepository.findByContactEmail(loginRequest.getEmail()).isEmpty()) {
            throw new RuntimeException("Bu e-posta adresi ile kayıtlı bir kulüp hesabı bulunamadı.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);
    }

    public User registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));

        return userRepository.save(user);
    }
}
