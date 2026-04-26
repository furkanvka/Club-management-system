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

    @Autowired
    private clubms.backend.service.TaskService taskService;

    @GetMapping("/{membershipId}/tasks")
    public ResponseEntity<List<clubms.backend.entity.Task>> getMemberTasks(@PathVariable Long clubId, @PathVariable Long membershipId) {
        return ResponseEntity.ok(taskService.getTasksByAssignedToId(membershipId));
    }

    @GetMapping("/{membershipId}/history")
    public ResponseEntity<clubms.backend.dto.response.MemberHistoryResponse> getMemberHistory(@PathVariable Long clubId, @PathVariable Long membershipId) {
        return ResponseEntity.ok(memberService.getMemberHistory(membershipId));
    }

    @GetMapping
    public ResponseEntity<List<Membership>> getMembers(@PathVariable Long clubId) {
        return ResponseEntity.ok(memberService.getMembersByClubId(clubId));
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

    @PutMapping("/{memberId}/role")
    public ResponseEntity<Membership> updateRole(@PathVariable Long clubId, @PathVariable Long memberId, @RequestBody String role) {
        return ResponseEntity.ok(memberService.updateRole(memberId, role));
    }
}
