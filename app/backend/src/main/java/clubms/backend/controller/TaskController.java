package clubms.backend.controller;

import clubms.backend.entity.Task;
import clubms.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import clubms.backend.repository.ProjectRepository;

@RestController
@RequestMapping("/api/clubs/{clubId}/projects/{projectId}/tasks")
public class TaskController {
    @Autowired private TaskService taskService;
    @Autowired private ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long clubId, @PathVariable Long projectId) {
        return projectRepository.findByIdAndClubId(projectId, clubId)
            .map(p -> ResponseEntity.ok(taskService.getTasksByProjectId(projectId)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@PathVariable Long clubId, @PathVariable Long projectId, @RequestBody Task task) {
        return projectRepository.findByIdAndClubId(projectId, clubId).map(p -> {
            task.setProject(p);
            return ResponseEntity.ok(taskService.createTask(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long clubId, @PathVariable Long projectId, @PathVariable Long id, @RequestBody Task task) {
        return projectRepository.findByIdAndClubId(projectId, clubId).map(p -> {
            task.setId(id);
            task.setProject(p);
            return ResponseEntity.ok(taskService.updateTask(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long clubId, @PathVariable Long projectId, @PathVariable Long id) {
        if (projectRepository.findByIdAndClubId(projectId, clubId).isPresent()) {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
