package clubms.backend.controller;

import clubms.backend.entity.Club;
import clubms.backend.entity.Event;
import clubms.backend.service.ClubService;
import clubms.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private EventService eventService;

    @GetMapping("/clubs")
    public ResponseEntity<List<Club>> getApprovedClubs() {
        return ResponseEntity.ok(clubService.getAllClubs().stream()
            .filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus()))
            .collect(Collectors.toList()));
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        // Tüm onaylı kulüplerin etkinliklerini getir
        return ResponseEntity.ok(eventService.getAllEvents());
    }
}
