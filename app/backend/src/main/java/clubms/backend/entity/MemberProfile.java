package clubms.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "member_profiles")
public class MemberProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id")
    private Membership membership;

    private String fullName;
    private String phone;
    private String department;
    private Integer classYear;
    private String avatarUrl;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Membership getMembership() { return membership; }
    public void setMembership(Membership membership) { this.membership = membership; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getClassYear() { return classYear; }
    public void setClassYear(Integer classYear) { this.classYear = classYear; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
