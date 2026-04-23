package clubms.backend.controller;

import clubms.backend.entity.Event;
import clubms.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<Event> createEvent(@PathVariable Long clubId, @RequestBody Event event) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isAuthorized = false;
        if (principal instanceof UserPrincipal) {
            UserPrincipal up = (UserPrincipal) principal;
            if (up.getId() < 0) isAuthorized = true;
            else {
                isAuthorized = memberService.getMembershipsByUserId(up.getId()).stream()
                    .anyMatch(m -> m.getClub().getId().equals(clubId) && "baskan".equalsIgnoreCase(m.getRole()));
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
}
