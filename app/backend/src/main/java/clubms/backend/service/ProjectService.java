package clubms.backend.service;

import clubms.backend.entity.Project;
import clubms.backend.entity.Team;
import clubms.backend.repository.ProjectRepository;
import clubms.backend.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TeamRepository teamRepository;

    public List<Project> getProjectsByClubId(Long clubId) { 
        return projectRepository.findByClubId(clubId); 
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
