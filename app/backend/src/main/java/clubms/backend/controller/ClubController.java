package clubms.backend.controller;

import clubms.backend.entity.Club;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import clubms.backend.service.MemberService;
import clubms.backend.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private MemberService memberService;

    @GetMapping("/my")
    public ResponseEntity<List<Club>> getMyClubs() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) principal;
            
            if (userPrincipal.getId() < 0) {
                Club club = clubService.getClubById(-userPrincipal.getId()).orElse(null);
                if (club != null) {
                    return ResponseEntity.ok(java.util.List.of(club));
                }
                return ResponseEntity.ok(java.util.List.of());
            }

            List<Club> myClubs = memberService.getMembershipsByUserId(userPrincipal.getId())
                .stream()
                .map(m -> m.getClub())
                .filter(club -> club != null)
                .collect(Collectors.toList());
            return ResponseEntity.ok(myClubs);
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/my-memberships")
    public ResponseEntity<?> getMyMemberships() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) principal;
            if (userPrincipal.getId() < 0) {
                return ResponseEntity.ok(List.of()); // Club accounts have no memberships
            }
            return ResponseEntity.ok(memberService.getMembershipsByUserId(userPrincipal.getId()));
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        List<Club> visibleClubs = clubService.getAllClubs().stream()
            .filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(visibleClubs);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinClub(@PathVariable Long id) {
        return clubService.getClubById(id).map(club -> {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof UserPrincipal)) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            UserPrincipal userPrincipal = (UserPrincipal) principal;
            if (userPrincipal.getId() == null || userPrincipal.getId() < 0) {
                return ResponseEntity.status(403).body("Only students can join clubs");
            }
            
            clubms.backend.entity.User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user == null) return ResponseEntity.status(404).body("User not found");

            if (memberService.findByUserIdAndClubId(user.getId(), id).isPresent()) {
                return ResponseEntity.status(409).body("Already a member");
            }

            clubms.backend.entity.Membership membership = new clubms.backend.entity.Membership();
            membership.setRole("uye");
            membership.setStatus("passive");
            membership.setUser(user);
            membership.setClub(club);
            return ResponseEntity.ok(memberService.createMembership(membership));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable Long id) {
        return clubService.getClubById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private clubms.backend.repository.UserRepository userRepository;

    @Autowired
    private clubms.backend.service.DocumentService documentService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<?> createClub(@RequestBody Club club) {
        try {
            if (club.getPassword() != null && !club.getPassword().isEmpty()) {
                club.setPassword(passwordEncoder.encode(club.getPassword()));
            }
            
            Club savedClub = clubService.createClub(club);

            // Eğer tüzük dosyası varsa, onu otomatik olarak onaylanmış bir belge olarak ekle
            if (savedClub.getStatuteFileData() != null && !savedClub.getStatuteFileData().isEmpty()) {
                clubms.backend.entity.Document statuteDoc = new clubms.backend.entity.Document();
                statuteDoc.setClub(savedClub);
                statuteDoc.setTitle("Kulüp Tüzüğü");
                statuteDoc.setCategory("Resmi");
                statuteDoc.setFileData(savedClub.getStatuteFileData());
                statuteDoc.setApprovalStatus("APPROVED");
                statuteDoc.setDescription("Kayıt sırasında yüklenen resmi kulüp tüzüğü.");
                documentService.saveDocumentInfo(statuteDoc);
            }

            org.springframework.security.core.Authentication currentAuth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (currentAuth != null && currentAuth.isAuthenticated() && currentAuth.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) currentAuth.getPrincipal();
                if (userPrincipal.getId() != null && userPrincipal.getId() > 0) { // Only if it's a real user, not a club
                    userRepository.findById(userPrincipal.getId()).ifPresent(user -> {
                        clubms.backend.entity.Membership membership = new clubms.backend.entity.Membership();
                        membership.setClub(savedClub);
                        membership.setUser(user);
                        membership.setRole("baskan");
                        membership.setStatus("active");
                        membership.setFlags("{\"yonetici\": true}");
                        memberService.createMembership(membership);
                    });
                }
            }
            return ResponseEntity.ok(savedClub);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating club: " + e.getMessage());
        }
    }
}
