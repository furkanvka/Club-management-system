package clubms.backend.controller;

import clubms.backend.entity.Event;
import clubms.backend.entity.EventApplication;
import clubms.backend.entity.Membership;
import clubms.backend.security.UserPrincipal;
import clubms.backend.service.EventApplicationService;
import clubms.backend.service.EventService;
import clubms.backend.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/events/{eventId}/applications")
public class EventApplicationController {

    @Autowired
    private EventApplicationService eventApplicationService;

    @Autowired
    private EventService eventService;

    @Autowired
    private MemberService memberService;

    @GetMapping
    public ResponseEntity<List<EventApplication>> getApplications(@PathVariable Long clubId, @PathVariable Long eventId) {
        return ResponseEntity.ok(eventApplicationService.getApplicationsByEventId(eventId));
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyToEvent(@PathVariable Long clubId, @PathVariable Long eventId) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Membership membership = memberService.getMembershipsByUserId(userPrincipal.getId()).stream()
                .filter(m -> m.getClub().getId().equals(clubId))
                .findFirst()
                .orElse(null);

        if (membership == null) return ResponseEntity.status(401).body("Not a member of this club");

        if (eventApplicationService.getApplication(eventId, membership.getId()).isPresent()) {
            return ResponseEntity.status(409).body("Already applied");
        }

        Event event = eventService.getEventsByClubId(clubId).stream()
                .filter(e -> e.getId().equals(eventId))
                .findFirst()
                .orElse(null);

        if (event == null) return ResponseEntity.notFound().build();

        EventApplication application = new EventApplication();
        application.setEvent(event);
        application.setMembership(membership);
        application.setStatus("pending");

        return ResponseEntity.ok(eventApplicationService.saveApplication(application));
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<EventApplication> updateApplicationStatus(
            @PathVariable Long clubId,
            @PathVariable Long eventId,
            @PathVariable Long applicationId,
            @RequestBody String status) {
        // Simple status update, ideally check for admin/baskan role here
        return eventApplicationService.getById(applicationId)
                .map(app -> {
                    app.setStatus(status.replace("\"", "")); // remove quotes if sent as plain string
                    return ResponseEntity.ok(eventApplicationService.saveApplication(app));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
