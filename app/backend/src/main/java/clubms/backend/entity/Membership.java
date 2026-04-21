package clubms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "memberships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "club_id"})
})
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;

    @Column(nullable = false)
    private String role; // 'uye', 'ekip-uyesi', 'ekip-lideri', 'baskan', 'sayman', 'sekreter'

    @Column(columnDefinition = "JSONB")
    private String flags; // {"yonetici": true, "finans": true, "docs": true} - Can use string for simplicity or proper JSON mapping

    private String status = "pending"; // pending, active, inactive

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if(joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Club getClub() { return club; }
    public void setClub(Club club) { this.club = club; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFlags() { return flags; }
    public void setFlags(String flags) { this.flags = flags; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
