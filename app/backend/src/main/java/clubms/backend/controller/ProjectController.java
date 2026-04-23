package clubms.backend.controller;

import clubms.backend.entity.Project;
import clubms.backend.service.ProjectService;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/projects")
public class ProjectController {
    @Autowired private ProjectService projectService;
    @Autowired private ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Project>> getProjects(@PathVariable Long clubId) {
        return ResponseEntity.ok(projectService.getProjectsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@PathVariable Long clubId, @RequestBody Project project, @RequestParam Long requesterId) {
        return clubService.getClubById(clubId).map(club -> {
            project.setClub(club);
            return ResponseEntity.ok(projectService.createProject(project, requesterId));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, @RequestParam Long requesterId) {
        projectService.deleteProject(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}
