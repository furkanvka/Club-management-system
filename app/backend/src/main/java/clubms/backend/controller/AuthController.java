package clubms.backend.controller;

import clubms.backend.dto.request.ChangePasswordRequest;
import clubms.backend.dto.request.LoginRequest;
import clubms.backend.dto.request.RegisterRequest;
import clubms.backend.dto.request.ResetPasswordRequest;
import clubms.backend.dto.response.JwtAuthResponse;
import clubms.backend.entity.User;
import clubms.backend.security.UserPrincipal;
import clubms.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String jwt = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(new JwtAuthResponse(jwt));
    }

    @PostMapping("/club-login")
    public ResponseEntity<JwtAuthResponse> authenticateClub(@Valid @RequestBody LoginRequest loginRequest) {
        String jwt = authService.authenticateClub(loginRequest);
        return ResponseEntity.ok(new JwtAuthResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        User result = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Şifre başarıyla güncellendi."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            authService.changePassword(userPrincipal.getId(), request);
            return ResponseEntity.ok(Map.of("message", "Şifre başarıyla değiştirildi."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

