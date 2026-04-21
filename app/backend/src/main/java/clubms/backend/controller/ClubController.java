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
            .filter(c -> !"REJECTED".equals(c.getStatus()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(visibleClubs);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Club>> getPendingClubs() {
        List<Club> pendingClubs = clubService.getAllClubs().stream()
            .filter(c -> "PENDING".equals(c.getStatus()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(pendingClubs);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Club> approveClub(@PathVariable Long id) {
        return clubService.getClubById(id).map(club -> {
            club.setStatus("APPROVED");
            return ResponseEntity.ok(clubService.createClub(club)); // saves it
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Club> rejectClub(@PathVariable Long id) {
        return clubService.getClubById(id).map(club -> {
            club.setStatus("REJECTED");
            return ResponseEntity.ok(clubService.createClub(club)); // saves it
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

    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        Club savedClub = clubService.createClub(club);

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) principal;
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
        return ResponseEntity.ok(savedClub);
    }
}
