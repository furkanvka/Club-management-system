package clubms.backend.service;

import clubms.backend.dto.request.ChangePasswordRequest;
import clubms.backend.dto.request.LoginRequest;
import clubms.backend.dto.request.RegisterRequest;
import clubms.backend.dto.request.ResetPasswordRequest;
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
        var clubOpt = clubRepository.findByContactEmail(loginRequest.getEmail());
        if (clubOpt.isEmpty()) {
            throw new RuntimeException("Bu e-posta adresi ile kayıtlı bir kulüp hesabı bulunamadı.");
        }
        
        var club = clubOpt.get();
        if (!"APPROVED".equals(club.getStatus())) {
            if ("REJECTED".equals(club.getStatus())) {
                throw new RuntimeException("Kulüp başvurunuz reddedilmiştir. Giriş yapılamaz.");
            }
            throw new RuntimeException("Kulüp başvurunuz henüz onaylanmamıştır. Lütfen yönetici onayını bekleyin.");
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
            throw new RuntimeException("Bu e-posta adresi zaten kullanımda!");
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setStudentNumber(signUpRequest.getStudentNumber());

        return userRepository.save(user);
    }

    /**
     * Public password reset — user provides email + new password (twice).
     * No email verification for simplicity.
     */
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new RuntimeException("Şifreler eşleşmiyor!");
        }

        // Try users table first
        java.util.Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return;
        }

        // Try clubs table
        var clubOpt = clubRepository.findByContactEmail(request.getEmail());
        if (clubOpt.isPresent()) {
            var club = clubOpt.get();
            club.setPassword(passwordEncoder.encode(request.getNewPassword()));
            clubRepository.save(club);
            return;
        }

        throw new RuntimeException("Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.");
    }

    /**
     * Authenticated password change — user must provide current password.
     */
    public void changePassword(Long userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new RuntimeException("Yeni şifreler eşleşmiyor!");
        }

        // If userId is negative, it's a club account
        if (userId < 0) {
            var club = clubRepository.findById(-userId)
                    .orElseThrow(() -> new RuntimeException("Kulüp hesabı bulunamadı."));

            if (!passwordEncoder.matches(request.getCurrentPassword(), club.getPassword())) {
                throw new RuntimeException("Mevcut şifre yanlış!");
            }

            club.setPassword(passwordEncoder.encode(request.getNewPassword()));
            clubRepository.save(club);
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Mevcut şifre yanlış!");
            }

            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        }
    }
}
