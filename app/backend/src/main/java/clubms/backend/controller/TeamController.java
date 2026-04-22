package clubms.backend.controller;

import clubms.backend.entity.Team;
import clubms.backend.entity.TeamMember;
import clubms.backend.service.TeamService;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/teams")
public class TeamController {
    @Autowired private TeamService teamService;
    @Autowired private ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Team>> getTeams(@PathVariable Long clubId) {
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
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMember>> getMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMember> addMember(@PathVariable Long teamId, @RequestBody TeamMember tm) {
        clubms.backend.entity.Team t = new clubms.backend.entity.Team();
        t.setId(teamId);
        tm.setTeam(t);
        return ResponseEntity.ok(teamService.addTeamMember(tm));
    }

    @DeleteMapping("/{teamId}/members/{tmId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long tmId) {
        teamService.removeTeamMember(tmId);
        return ResponseEntity.noContent().build();
    }
}
