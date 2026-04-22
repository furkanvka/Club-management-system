package clubms.backend.controller;

import clubms.backend.service.ClubService;
import clubms.backend.service.MemberService;
import clubms.backend.service.FinanceService;
import clubms.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/backup")
public class BackupController {

    @Autowired private ClubService clubService;
    @Autowired private MemberService memberService;
    @Autowired private FinanceService financeService;
    @Autowired private EventService eventService;

    @GetMapping("/download")
    public ResponseEntity<Map<String, Object>> downloadBackup() {
        // Simplified JSON backup of major tables
        Map<String, Object> backup = new HashMap<>();
        backup.put("timestamp", java.time.LocalDateTime.now().toString());
        backup.put("clubs", clubService.getAllClubs());
        backup.put("events", eventService.getAllEvents());
        
        return ResponseEntity.ok(backup);
    }
}
