package clubms.backend.controller;

import clubms.backend.entity.Team;
import clubms.backend.entity.TeamMember;
import clubms.backend.service.TeamService;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import clubms.backend.repository.TeamRepository;

@RestController
@RequestMapping("/api/clubs/{clubId}/teams")
public class TeamController {
    @Autowired private TeamService teamService;
    @Autowired private ClubService clubService;
    @Autowired private TeamRepository teamRepository;

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

    @PostMapping("/{teamId}/members")
    public ResponseEntity<TeamMember> addMember(@PathVariable Long clubId, @PathVariable Long teamId, @RequestBody TeamMember tm) {
        return teamRepository.findByIdAndClubId(teamId, clubId).map(t -> {
            tm.setTeam(t);
            return ResponseEntity.ok(teamService.addTeamMember(tm));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{teamId}/members/{tmId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long clubId, @PathVariable Long teamId, @PathVariable Long tmId) {
        if (teamRepository.findByIdAndClubId(teamId, clubId).isPresent()) {
            teamService.removeTeamMember(tmId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
