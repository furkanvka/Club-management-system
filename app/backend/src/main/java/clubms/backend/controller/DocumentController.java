package clubms.backend.controller;

import clubms.backend.entity.Document;
import clubms.backend.service.DocumentService;
import clubms.backend.service.MemberService;
import clubms.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clubs/{clubId}/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @Autowired
    private MemberService memberService;

    @GetMapping
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long clubId) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isManager = false;
        if (principal instanceof UserPrincipal) {
            UserPrincipal up = (UserPrincipal) principal;
            if (up.getId() < 0) isManager = true; // Club login
            else {
                isManager = memberService.getMembershipsByUserId(up.getId()).stream()
                    .anyMatch(m -> m.getClub().getId().equals(clubId) && 
                              ("baskan".equalsIgnoreCase(m.getRole()) || (m.getFlags() != null && m.getFlags().contains("\"docs\":true"))));
            }
        }

        List<Document> allDocs = documentService.getDocumentsByClubId(clubId);
        if (isManager) return ResponseEntity.ok(allDocs);
        
        return ResponseEntity.ok(allDocs.stream()
            .filter(d -> "APPROVED".equalsIgnoreCase(d.getApprovalStatus()))
            .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Document> saveDocument(@PathVariable Long clubId, @RequestBody Document document) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String role = "uye";
        if (principal instanceof UserPrincipal) {
            UserPrincipal up = (UserPrincipal) principal;
            if (up.getId() < 0) role = "baskan";
            else {
                role = memberService.getMembershipsByUserId(up.getId()).stream()
                    .filter(m -> m.getClub().getId().equals(clubId))
                    .map(m -> m.getRole().toLowerCase())
                    .findFirst().orElse("uye");
            }
        }

        final String userRole = role;
        return clubService.getClubById(clubId).map(club -> {
            document.setClub(club);
            // Baskan, Lider ve Ekip Uyesi yukleyebilir. Lider ve Uye yuklerse oto-onaylanabilir veya baskan onayına duser.
            // Sizin isteginize gore yukleme hakları var.
            if ("baskan".equals(userRole) || "ekip_lideri".equals(userRole) || "ekip_uyesi".equals(userRole)) {
                document.setApprovalStatus("APPROVED"); // Ekip calısması icin oto-onay
            } else {
                document.setApprovalStatus("PENDING");
            }
            return ResponseEntity.ok(documentService.saveDocumentInfo(document));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{documentId}/approve")
    public ResponseEntity<Document> approveDocument(@PathVariable Long clubId, @PathVariable Long documentId) {
        return documentService.getDocumentsByClubId(clubId).stream()
            .filter(d -> d.getId().equals(documentId))
            .findFirst()
            .map(doc -> {
                doc.setApprovalStatus("APPROVED");
                return ResponseEntity.ok(documentService.saveDocumentInfo(doc));
            }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{documentId}/reject")
    public ResponseEntity<Document> rejectDocument(@PathVariable Long clubId, @PathVariable Long documentId) {
        return documentService.getDocumentsByClubId(clubId).stream()
            .filter(d -> d.getId().equals(documentId))
            .findFirst()
            .map(doc -> {
                doc.setApprovalStatus("REJECTED");
                return ResponseEntity.ok(documentService.saveDocumentInfo(doc));
            }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long clubId, @PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}
