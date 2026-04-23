package clubms.backend.controller;

import clubms.backend.entity.Club;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ClubService clubService;

    @GetMapping("/clubs/pending")
    public ResponseEntity<List<Club>> getPendingClubs() {
        List<Club> pendingClubs = clubService.getAllClubs().stream()
            .filter(c -> "PENDING".equals(c.getStatus()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(pendingClubs);
    }

    @PutMapping("/clubs/{id}/approve")
    public ResponseEntity<Club> approveClub(@PathVariable Long id) {
        return clubService.getClubById(id).map(club -> {
            club.setStatus("APPROVED");
            return ResponseEntity.ok(clubService.createClub(club));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/clubs/{id}/reject")
    public ResponseEntity<Club> rejectClub(@PathVariable Long id) {
        return clubService.getClubById(id).map(club -> {
            club.setStatus("REJECTED");
            return ResponseEntity.ok(clubService.createClub(club));
        }).orElse(ResponseEntity.notFound().build());
    }
}
