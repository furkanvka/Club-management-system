package clubms.backend.controller;

import clubms.backend.entity.Club;
import clubms.backend.entity.Membership;
import clubms.backend.service.MemberService;
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

    @GetMapping
    public ResponseEntity<List<Membership>> getMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(memberService.getMembersByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<Membership> addMember(@PathVariable Long clubId, @RequestBody Membership membership) {
        return clubService.getClubById(clubId).map(club -> {
            membership.setClub(club);
            return ResponseEntity.ok(memberService.createMembership(membership));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long clubId, @PathVariable Long memberId) {
        memberService.deleteMembership(memberId);
        return ResponseEntity.noContent().build();
    }
}
