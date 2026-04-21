package clubms.backend.dto.request;

public class JoinRequest {
    private String role;
    private String password;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
