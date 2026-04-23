package clubms.backend.controller;

import clubms.backend.entity.MeetingReport;
import clubms.backend.service.MeetingReportService;
import clubms.backend.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import clubms.backend.service.MemberService;
import clubms.backend.security.UserPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/clubs/{clubId}/meetings")
public class MeetingReportController {

    @Autowired
    private MeetingReportService meetingReportService;

    @Autowired
    private ClubService clubService;

    @Autowired
    private MemberService memberService;

    @GetMapping
    public ResponseEntity<List<MeetingReport>> getMeetings(@PathVariable Long clubId) {
        return ResponseEntity.ok(meetingReportService.getReportsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<MeetingReport> createMeeting(@PathVariable Long clubId, @RequestBody MeetingReport report) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isAuthorized = false;
        if (principal instanceof UserPrincipal) {
            UserPrincipal up = (UserPrincipal) principal;
            if (up.getId() < 0) isAuthorized = true;
            else {
                isAuthorized = memberService.getMembershipsByUserId(up.getId()).stream()
                    .anyMatch(m -> m.getClub().getId().equals(clubId) && 
                              ("baskan".equalsIgnoreCase(m.getRole()) || "ekip_lideri".equalsIgnoreCase(m.getRole())));
            }
        }

        if (!isAuthorized) {
            return ResponseEntity.status(403).build();
        }

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
