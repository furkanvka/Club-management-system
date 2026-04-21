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
            List<Club> myClubs = memberService.getMembershipsByUserId(userPrincipal.getId())
                .stream()
                .map(m -> m.getClub())
                .collect(Collectors.toList());
            return ResponseEntity.ok(myClubs);
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
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
