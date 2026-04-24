package clubms.backend.service;

import clubms.backend.entity.Project;
import clubms.backend.entity.Team;
import clubms.backend.entity.Membership;
import clubms.backend.repository.ProjectRepository;
import clubms.backend.repository.TeamRepository;
import clubms.backend.repository.MembershipRepository;
import clubms.backend.repository.TeamMemberRepository;
import clubms.backend.entity.TeamMember;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private MembershipRepository membershipRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;

    public List<Project> getProjectsByClubId(Long clubId) { 
        return projectRepository.findByClubId(clubId); 
    }

    public List<Project> getProjectsByMembershipId(Long clubId, Long membershipId) {
        Membership m = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Üyelik bulunamadı"));
        
        // Başkan ise her şeyi görür
        if ("baskan".equalsIgnoreCase(m.getRole())) {
            return projectRepository.findByClubId(clubId);
        }

        // Değilse, sadece dahil olduğu ekiplerin projelerini görür
        // 1. Lideri olduğu ekipler
        Set<Long> myTeamIds = teamRepository.findByClubId(clubId).stream()
                .filter(t -> t.getLeader() != null && t.getLeader().getId().equals(membershipId))
                .map(Team::getId)
                .collect(Collectors.toSet());

        // 2. Üyesi olduğu ekipler
        myTeamIds.addAll(teamMemberRepository.findByMembershipId(membershipId).stream()
                .map(tm -> tm.getTeam().getId())
                .collect(Collectors.toSet()));

        return myTeamIds.stream()
                .flatMap(tid -> projectRepository.findByTeamId(tid).stream())
                .collect(Collectors.toList());
    }

    public List<Project> getProjectsByTeamId(Long teamId) {
        return projectRepository.findByTeamId(teamId);
    }

    public Project createProject(Project project, Long requesterMembershipId) {
        if (project.getTeam() == null) {
            throw new RuntimeException("Proje bir ekibe bağlı olmalıdır.");
        }

        Team team = teamRepository.findById(project.getTeam().getId())
                .orElseThrow(() -> new RuntimeException("Ekip bulunamadı"));

        // Sadece ekip lideri proje oluşturabilir
        if (!team.getLeader().getId().equals(requesterMembershipId)) {
            throw new RuntimeException("Sadece ekip lideri proje oluşturabilir.");
        }

        return projectRepository.save(project);
    }

    public void deleteProject(Long id, Long requesterMembershipId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proje bulunamadı"));
        
        // Sadece ekip lideri projeyi silebilir
        if (!project.getTeam().getLeader().getId().equals(requesterMembershipId)) {
            throw new RuntimeException("Sadece ekip lideri projeyi silebilir.");
        }

        projectRepository.deleteById(id);
    }
}
