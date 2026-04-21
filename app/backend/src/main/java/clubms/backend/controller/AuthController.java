package clubms.backend.controller;

import clubms.backend.dto.request.LoginRequest;
import clubms.backend.dto.request.RegisterRequest;
import clubms.backend.dto.response.JwtAuthResponse;
import clubms.backend.entity.User;
import clubms.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
