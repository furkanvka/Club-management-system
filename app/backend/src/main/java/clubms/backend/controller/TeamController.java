package clubms.backend.controller;

import clubms.backend.entity.Team;
import clubms.backend.entity.TeamMember;
import clubms.backend.entity.MeetingReport;
import clubms.backend.entity.Document;
import clubms.backend.service.TeamService;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import clubms.backend.repository.TeamRepository;

@RestController
@RequestMapping("/api/clubs/{clubId}/teams")
public class TeamController {
    @Autowired private TeamService teamService;
    @Autowired private ClubService clubService;
    @Autowired private TeamRepository teamRepository;

    @GetMapping
    public ResponseEntity<List<Team>> getTeams(@PathVariable Long clubId, @RequestParam(required = false) Long requesterId) {
        if (requesterId != null) {
            return ResponseEntity.ok(teamService.getTeamsByMembershipId(clubId, requesterId));
        }
        return ResponseEntity.ok(teamService.getTeamsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@PathVariable Long clubId, @RequestBody Team team) {
        return clubService.getClubById(clubId).map(club -> {
            team.setClub(club);
            return ResponseEntity.ok(teamService.createTeam(team));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long clubId, @PathVariable Long id) {
        if (teamRepository.findByIdAndClubId(id, clubId).isPresent()) {
            teamService.deleteTeam(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMember>> getMembers(@PathVariable Long clubId, @PathVariable Long teamId) {
        return teamRepository.findByIdAndClubId(teamId, clubId)
            .map(t -> ResponseEntity.ok(teamService.getTeamMembers(teamId)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{teamId}/performance")
    public ResponseEntity<Map<String, Object>> getTeamPerformance(@PathVariable Long clubId, @PathVariable Long teamId) {
        return teamRepository.findByIdAndClubId(teamId, clubId)
            .map(t -> ResponseEntity.ok(teamService.getTeamPerformance(teamId)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{teamId}/members/{membershipId}/history")
    public ResponseEntity<Map<String, Object>> getMemberHistory(@PathVariable Long clubId, @PathVariable Long teamId, @PathVariable Long membershipId, @RequestParam(required = false) Long requesterId) {
        
        // 1. Yetki Kontrolü
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isFullAccess = (auth != null && auth.getAuthorities().stream().anyMatch(a -> 
            a.getAuthority().equals("ROLE_CLUB") || a.getAuthority().equals("ROLE_ADMIN"))) || isRequesterBaskan(requesterId);

        // 2. Global Görünüm (Üyeler Sayfası): Sadece Başkan/Admin görebilir
        if (teamId == 0) {
            if (isFullAccess) {
                return ResponseEntity.ok(teamService.getMemberHistory(teamId, membershipId, requesterId));
            }
            return ResponseEntity.status(403).build();
        }

        // 3. Ekip Görünümü (Ekipler Sayfası): Başkan/Admin VEYA Ekip Lideri görebilir
        return teamRepository.findByIdAndClubId(teamId, clubId)
            .map(t -> {
                boolean isTeamLeader = t.getLeader() != null && t.getLeader().getId().equals(requesterId);
                if (isFullAccess || isTeamLeader) {
                    return ResponseEntity.ok(teamService.getMemberHistory(teamId, membershipId, requesterId));
                }
                return ResponseEntity.status(403).<Map<String, Object>>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @Autowired private clubms.backend.repository.MembershipRepository membershipRepository;
    
    private boolean isRequesterBaskan(Long requesterId) {
        if (requesterId == null) return false;
        return membershipRepository.findById(requesterId)
            .map(m -> m.getRole() != null && m.getRole().toUpperCase().contains("BASKAN"))
            .orElse(false);
    }

    @GetMapping("/{teamId}/meetings")
    public ResponseEntity<List<MeetingReport>> getTeamMeetings(@PathVariable Long clubId, @PathVariable Long teamId) {
        return teamRepository.findByIdAndClubId(teamId, clubId)
            .map(t -> ResponseEntity.ok(teamService.getTeamMeetings(teamId)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{teamId}/documents")
    public ResponseEntity<List<Document>> getTeamDocuments(@PathVariable Long clubId, @PathVariable Long teamId) {
        return teamRepository.findByIdAndClubId(teamId, clubId)
            .map(t -> ResponseEntity.ok(teamService.getTeamDocuments(teamId)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-teams")
    public ResponseEntity<List<Team>> getMyTeams(@PathVariable Long clubId, @RequestParam Long membershipId) {
        return ResponseEntity.ok(teamService.getMyTeams(membershipId));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMember> addMember(@PathVariable Long clubId, @PathVariable Long teamId, 
                                               @RequestBody TeamMember tm, @RequestParam Long requesterId) {
        return teamRepository.findByIdAndClubId(teamId, clubId).map(t -> {
            return ResponseEntity.ok(teamService.addTeamMember(teamId, tm.getMembership().getId(), requesterId));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{teamId}/members/{tmId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long clubId, @PathVariable Long teamId, 
                                            @PathVariable Long tmId, @RequestParam Long requesterId) {
        if (teamRepository.findByIdAndClubId(teamId, clubId).isPresent()) {
            teamService.removeTeamMember(tmId, requesterId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
