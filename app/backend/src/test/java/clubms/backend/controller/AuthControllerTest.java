package clubms.backend.controller;

import clubms.backend.dto.request.LoginRequest;
import clubms.backend.dto.request.RegisterRequest;
import clubms.backend.entity.User;
import clubms.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

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
    void authenticateUser_ReturnsJwt() throws Exception {
        when(authService.authenticateUser(any(LoginRequest.class))).thenReturn("mocked-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mocked-jwt-token"));
    }

    @Test
    void authenticateClub_ReturnsJwt() throws Exception {
        when(authService.authenticateClub(any(LoginRequest.class))).thenReturn("mocked-club-jwt-token");

        mockMvc.perform(post("/api/auth/club-login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mocked-club-jwt-token"));
    }

    @Test
    void registerUser_ReturnsUser() throws Exception {
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail(registerRequest.getEmail());
        savedUser.setFirstName(registerRequest.getFirstName());
        savedUser.setLastName(registerRequest.getLastName());
        
        when(authService.registerUser(any(RegisterRequest.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(registerRequest.getEmail()))
                .andExpect(jsonPath("$.firstName").value(registerRequest.getFirstName()))
                .andExpect(jsonPath("$.lastName").value(registerRequest.getLastName()));
    }
}
