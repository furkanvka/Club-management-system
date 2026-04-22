package clubms.backend.controller;

import clubms.backend.entity.Event;
import clubms.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(@PathVariable Long clubId) {
        return ResponseEntity.ok(eventService.getEventsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@PathVariable Long clubId, @RequestBody Event event) {
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
