package clubms.backend.service;

import clubms.backend.entity.Project;
import clubms.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {
    @Autowired private ProjectRepository projectRepository;

    public List<Project> getProjectsByClubId(Long clubId) { return projectRepository.findByClubId(clubId); }
    public Project createProject(Project project) { return projectRepository.save(project); }
    public void deleteProject(Long id) { projectRepository.deleteById(id); }
}
