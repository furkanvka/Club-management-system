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
    public ResponseEntity<Task> createTask(@PathVariable Long clubId, @PathVariable Long projectId, 
                                          @RequestBody Task task, @RequestParam Long requesterId) {
        return projectRepository.findByIdAndClubId(projectId, clubId).map(p -> {
            task.setProject(p);
            return ResponseEntity.ok(taskService.createTask(task, requesterId));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long clubId, @PathVariable Long projectId, 
                                                @PathVariable Long id, @RequestParam String status, 
                                                @RequestParam Long requesterId) {
        return projectRepository.findByIdAndClubId(projectId, clubId).map(p -> {
            return ResponseEntity.ok(taskService.updateTaskStatus(id, status, requesterId));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long clubId, @PathVariable Long projectId, 
                                          @PathVariable Long id, @RequestParam Long requesterId) {
        if (projectRepository.findByIdAndClubId(projectId, clubId).isPresent()) {
            taskService.deleteTask(id, requesterId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
