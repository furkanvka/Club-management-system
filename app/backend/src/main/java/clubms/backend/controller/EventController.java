package clubms.backend.controller;

import clubms.backend.entity.Event;
import clubms.backend.entity.EventStaff;
import clubms.backend.entity.Membership;
import clubms.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import clubms.backend.service.MemberService;
import clubms.backend.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/clubs/{clubId}/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @Autowired
    private MemberService memberService;

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(@PathVariable Long clubId) {
        return ResponseEntity.ok(eventService.getEventsByClubId(clubId));
    }

    @GetMapping("/responsible")
    public ResponseEntity<List<Event>> getMyResponsibleEvents(@PathVariable Long clubId, @RequestParam Long membershipId) {
        // In a real app, we should verify that this membershipId belongs to the authenticated user
        return ResponseEntity.ok(eventService.getEventsByResponsibleId(membershipId));
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@PathVariable Long clubId, @RequestBody Event event) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isAuthorized = false;
        if (principal instanceof UserPrincipal) {
            UserPrincipal up = (UserPrincipal) principal;
            if (up.getId() < 0) isAuthorized = true;
            else {
                isAuthorized = memberService.getMembershipsByUserId(up.getId()).stream()
                    .anyMatch(m -> m.getClub().getId().equals(clubId) && ("baskan".equalsIgnoreCase(m.getRole()) || "sayman".equalsIgnoreCase(m.getRole())));
            }
        }

        if (!isAuthorized) {
            return ResponseEntity.status(403).build();
        }

        return clubService.getClubById(clubId).map(club -> {
            event.setClub(club);
            return ResponseEntity.ok(eventService.createEvent(event));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long clubId, @PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    // --- Staff Management ---

    @GetMapping("/{eventId}/staff")
    public ResponseEntity<List<EventStaff>> getEventStaff(@PathVariable Long clubId, @PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventStaff(eventId));
    }

    @PostMapping("/{eventId}/staff")
    public ResponseEntity<?> addStaff(@PathVariable Long clubId, @PathVariable Long eventId, 
                                     @RequestBody EventStaff staff, @RequestParam Long requesterId) {
        // Simplified check: only president or the event responsible can add staff
        List<Event> events = eventService.getEventsByClubId(clubId);
        Optional<Event> eventOpt = events.stream().filter(e -> e.getId().equals(eventId)).findFirst();
        
        if (eventOpt.isEmpty()) return ResponseEntity.notFound().build();
        Event event = eventOpt.get();

        Membership requester = memberService.getMembershipById(requesterId).orElse(null);
        if (requester == null) return ResponseEntity.status(401).body("Requester not found");

        boolean canManage = "baskan".equalsIgnoreCase(requester.getRole()) || 
                           (event.getResponsible() != null && event.getResponsible().getId().equals(requesterId));

        if (!canManage) return ResponseEntity.status(403).body("Not authorized to manage staff for this event");

        staff.setEvent(event);
        return ResponseEntity.ok(eventService.addStaff(staff));
    }

    @DeleteMapping("/{eventId}/staff/{staffId}")
    public ResponseEntity<Void> removeStaff(@PathVariable Long clubId, @PathVariable Long eventId, 
                                           @PathVariable Long staffId, @RequestParam Long requesterId) {
        // Authorization check same as addStaff
        List<Event> events = eventService.getEventsByClubId(clubId);
        Optional<Event> eventOpt = events.stream().filter(e -> e.getId().equals(eventId)).findFirst();
        
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            Membership requester = memberService.getMembershipById(requesterId).orElse(null);
            if (requester != null && ("baskan".equalsIgnoreCase(requester.getRole()) || 
                (event.getResponsible() != null && event.getResponsible().getId().equals(requesterId)))) {
                eventService.removeStaff(staffId);
                return ResponseEntity.noContent().build();
            }
        }
        return ResponseEntity.status(403).build();
    }
}
