package clubms.backend.controller;

import clubms.backend.entity.Document;
import clubms.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long clubId) {
        return ResponseEntity.ok(documentService.getDocumentsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<Document> saveDocument(@PathVariable Long clubId, @RequestBody Document document) {
        return clubService.getClubById(clubId).map(club -> {
            document.setClub(club);
            return ResponseEntity.ok(documentService.saveDocumentInfo(document));
        }).orElse(ResponseEntity.notFound().build());
    }
}
