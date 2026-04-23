package clubms.backend.controller;

import clubms.backend.entity.Club;
import clubms.backend.entity.Membership;
import clubms.backend.service.MemberService;
import clubms.backend.entity.User;
import clubms.backend.security.UserPrincipal;
import clubms.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Membership>> getMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(memberService.getMembersByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<?> addMember(@PathVariable Long clubId) {
        return clubService.getClubById(clubId).map(club -> {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof UserPrincipal)) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            UserPrincipal userPrincipal = (UserPrincipal) principal;
            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            if (user == null) return ResponseEntity.status(404).body("User not found");

            // Prevent duplicate membership
            boolean alreadyMember = memberService.getMembersByClubId(clubId)
                .stream().anyMatch(m -> m.getUser() != null && m.getUser().getId().equals(userPrincipal.getId()));
            if (alreadyMember) return ResponseEntity.status(409).body("Already a member");

            Membership membership = new Membership();
            membership.setRole("uye");
            membership.setStatus("passive"); // Değişiklik: Yeni üye henüz ekipte olmadığı için pasif başlar
            membership.setUser(user);
            membership.setClub(club);
            return ResponseEntity.ok(memberService.createMembership(membership));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long clubId, @PathVariable Long memberId) {
        memberService.deleteMembership(memberId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{memberId}/flags")
    public ResponseEntity<Membership> updateFlags(@PathVariable Long clubId, @PathVariable Long memberId, @RequestBody String flags) {
        return ResponseEntity.ok(memberService.updateMembershipFlags(memberId, flags));
    }
}
