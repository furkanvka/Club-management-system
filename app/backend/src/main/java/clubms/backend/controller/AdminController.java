package clubms.backend.controller;

import clubms.backend.entity.Club;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import clubms.backend.entity.Document;
import clubms.backend.repository.DocumentRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private DocumentRepository documentRepository;

    @GetMapping("/clubs/pending")
    public ResponseEntity<List<Club>> getPendingClubs() {
        List<Club> pendingClubs = clubService.getAllClubs().stream()
            .filter(c -> "PENDING".equals(c.getStatus()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(pendingClubs);
    }

    @GetMapping("/clubs/all")
    public ResponseEntity<List<Club>> getAllManagedClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @PutMapping("/clubs/{id}/approve")
    public ResponseEntity<?> approveClub(@PathVariable Long id) {
        return clubService.getClubById(id).map(club -> {
            // Sadece PENDING kulüpler onaylanabilir
            if (!"PENDING".equals(club.getStatus())) {
                return ResponseEntity.badRequest().body("Bu kulüp zaten " + club.getStatus() + " durumundadır.");
            }
            club.setStatus("APPROVED");
            Club savedClub = clubService.createClub(club);

            // Create Statute Document if data exists
            if (club.getStatuteFileData() != null) {
                Document doc = new Document();
                doc.setClub(savedClub);
                doc.setTitle("Kulüp Tüzüğü");
                doc.setCategory("Resmi");
                doc.setFileData(club.getStatuteFileData());
                doc.setApprovalStatus("APPROVED");
                doc.setDescription("Kulüp kuruluş tüzüğü.");
                documentRepository.save(doc);
            }

            return ResponseEntity.ok((Object) savedClub);
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
