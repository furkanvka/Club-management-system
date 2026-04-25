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
        boolean isBaskan = false;
        boolean isStaff = false;
        
        if (principal instanceof UserPrincipal) {
            UserPrincipal up = (UserPrincipal) principal;
            if (up.getId() < 0) {
                isBaskan = true;
                isStaff = true;
            } else {
                List<clubms.backend.entity.Membership> memberships = memberService.getMembershipsByUserId(up.getId());
                isBaskan = memberships.stream()
                    .anyMatch(m -> m.getClub().getId().equals(clubId) && "baskan".equalsIgnoreCase(m.getRole()));
                
                isStaff = memberships.stream()
                    .anyMatch(m -> m.getClub().getId().equals(clubId) && 
                              ("baskan".equalsIgnoreCase(m.getRole()) || 
                               "ekip_lideri".equalsIgnoreCase(m.getRole()) || 
                               "ekip_uyesi".equalsIgnoreCase(m.getRole()) ||
                               (m.getFlags() != null && m.getFlags().contains("\"docs\":true"))));
            }
        }

        final boolean baskanRole = isBaskan;
        final boolean staffRole = isStaff;

        List<Document> allDocs = documentService.getDocumentsByClubId(clubId);
        
        return ResponseEntity.ok(allDocs.stream()
            .filter(d -> {
                // Onaylanmamışlar sadece staff'a
                if (!"APPROVED".equalsIgnoreCase(d.getApprovalStatus()) && !staffRole) return false;
                
                String cat = d.getCategory();
                if (cat == null) cat = "Diğer";

                // Kategori bazlı yetkilendirme
                if ("Resmi".equalsIgnoreCase(cat) || "Finans".equalsIgnoreCase(cat)) {
                    return baskanRole;
                }
                if ("Etkinlik".equalsIgnoreCase(cat) || "Proje".equalsIgnoreCase(cat)) {
                    return staffRole;
                }
                if ("Public".equalsIgnoreCase(cat)) {
                    return true;
                }
                
                // Diğer kategoriler (Şablon, Diğer vb.) varsayılan olarak staff görsün
                return staffRole;
            })
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

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long clubId, @PathVariable Long documentId) {
        return documentService.getDocumentsByClubId(clubId).stream()
            .filter(d -> d.getId().equals(documentId))
            .findFirst()
            .map(doc -> {
                if (doc.getFileData() == null) return ResponseEntity.notFound().<byte[]>build();
                try {
                    String fullData = doc.getFileData();
                    String base64Data = fullData;
                    String contentType = "application/pdf";
                    String extension = "pdf";

                    if (fullData.contains(",")) {
                        String prefix = fullData.split(",")[0];
                        base64Data = fullData.split(",")[1];
                        
                        if (prefix.contains("image/png")) { contentType = "image/png"; extension = "png"; }
                        else if (prefix.contains("image/jpeg")) { contentType = "image/jpeg"; extension = "jpg"; }
                        else if (prefix.contains("image/gif")) { contentType = "image/gif"; extension = "gif"; }
                        else if (prefix.contains("image/webp")) { contentType = "image/webp"; extension = "webp"; }
                        else if (prefix.contains("application/pdf")) { contentType = "application/pdf"; extension = "pdf"; }
                    }

                    byte[] data = java.util.Base64.getDecoder().decode(base64Data);
                    return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getTitle() + "." + extension + "\"")
                        .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                        .body(data);
                } catch (Exception e) {
                    return ResponseEntity.internalServerError().<byte[]>build();
                }
            }).orElse(ResponseEntity.notFound().build());
    }
}
