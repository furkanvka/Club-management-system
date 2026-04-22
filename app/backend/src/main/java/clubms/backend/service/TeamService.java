package clubms.backend.service;

import clubms.backend.entity.Team;
import clubms.backend.entity.TeamMember;
import clubms.backend.repository.TeamRepository;
import clubms.backend.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TeamService {
    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;

    public List<Team> getTeamsByClubId(Long clubId) {
        return teamRepository.findByClubId(clubId);
    }
    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }
    public TeamMember addTeamMember(TeamMember tm) {
        return teamMemberRepository.save(tm);
    }
    public void removeTeamMember(Long id) {
        teamMemberRepository.deleteById(id);
    }
}
