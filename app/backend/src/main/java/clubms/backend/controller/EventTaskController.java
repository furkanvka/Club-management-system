package clubms.backend.controller;

import clubms.backend.entity.Task;
import clubms.backend.entity.Event;
import clubms.backend.entity.Membership;
import clubms.backend.service.TaskService;
import clubms.backend.service.EventService;
import clubms.backend.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clubs/{clubId}/events/{eventId}/tasks")
public class EventTaskController {
    @Autowired private TaskService taskService;
    @Autowired private EventService eventService;
    @Autowired private MemberService memberService;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long clubId, @PathVariable Long eventId) {
        return ResponseEntity.ok(taskService.getTasksByEventId(eventId));
    }

    @PostMapping
    public ResponseEntity<?> createTask(@PathVariable Long clubId, @PathVariable Long eventId, 
                                          @RequestBody Task task, @RequestParam Long requesterId) {
        List<Event> events = eventService.getEventsByClubId(clubId);
        Optional<Event> eventOpt = events.stream().filter(e -> e.getId().equals(eventId)).findFirst();
        
        if (eventOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event event = eventOpt.get();

        Membership requester = memberService.getMembershipById(requesterId).orElse(null);
        if (requester == null) return ResponseEntity.status(401).body("Requester not found");

        boolean canManage = "baskan".equalsIgnoreCase(requester.getRole()) || 
                           (event.getResponsible() != null && event.getResponsible().getId().equals(requesterId));

        if (!canManage) return ResponseEntity.status(403).body("Not authorized to manage tasks for this event");

        task.setEvent(event);
        return ResponseEntity.ok(taskService.createTask(task, requesterId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long clubId, @PathVariable Long eventId, 
                                                @PathVariable Long id, @RequestParam String status, 
                                                @RequestParam Long requesterId) {
        // Users can always update status of tasks assigned to them
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, requesterId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long clubId, @PathVariable Long eventId, 
                                          @PathVariable Long id, @RequestParam Long requesterId) {
        taskService.deleteTask(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}
