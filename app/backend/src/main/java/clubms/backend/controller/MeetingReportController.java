package clubms.backend.controller;

import clubms.backend.entity.MeetingReport;
import clubms.backend.service.MeetingReportService;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/meetings")
public class MeetingReportController {

    @Autowired
    private MeetingReportService meetingReportService;

    @Autowired
    private ClubService clubService;

    @GetMapping
    public ResponseEntity<List<MeetingReport>> getMeetings(@PathVariable Long clubId) {
        return ResponseEntity.ok(meetingReportService.getReportsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<MeetingReport> createMeeting(@PathVariable Long clubId, @RequestBody MeetingReport report) {
        return clubService.getClubById(clubId).map(club -> {
            report.setClub(club);
            return ResponseEntity.ok(meetingReportService.saveReport(report));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        meetingReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
