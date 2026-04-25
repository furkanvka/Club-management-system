package clubms.backend.controller;

import clubms.backend.entity.*;
import clubms.backend.service.*;
import clubms.backend.repository.TeamMemberRepository;
import clubms.backend.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamRepository teamRepository;

    @GetMapping
    public ResponseEntity<List<MeetingReport>> getMeetings(@PathVariable Long clubId) {
        UserPrincipal up = getPrincipal();
        if (up == null) return ResponseEntity.status(401).build();

        // Admin (negative ID) sees all
        if (up.getId() < 0) return ResponseEntity.ok(meetingReportService.getReportsByClubId(clubId));

        Membership m = memberService.findByUserIdAndClubId(up.getId(), clubId).orElse(null);
        if (m == null) return ResponseEntity.status(403).build();

        List<MeetingReport> allMeetings = meetingReportService.getReportsByClubId(clubId);

        // Presidents see all
        if ("baskan".equalsIgnoreCase(m.getRole())) {
            return ResponseEntity.ok(allMeetings);
        }

        // Others see General meetings or their Team meetings
        List<Long> userTeamIds = teamMemberRepository.findByMembershipId(m.getId()).stream()
                .map(tm -> tm.getTeam().getId())
                .collect(Collectors.toList());

        List<MeetingReport> filtered = allMeetings.stream()
                .filter(meeting -> "GENEL".equalsIgnoreCase(meeting.getType()) || 
                                  (meeting.getTeam() != null && userTeamIds.contains(meeting.getTeam().getId())))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    @PostMapping
    public ResponseEntity<MeetingReport> createAnnouncement(@PathVariable Long clubId, @RequestBody MeetingReport report) {
        UserPrincipal up = getPrincipal();
        if (up == null) return ResponseEntity.status(401).build();

        boolean isClubLogin = up.getId() < 0;
        boolean isBaskan = isClubLogin;

        if (!isClubLogin) {
            Membership m = memberService.findByUserIdAndClubId(up.getId(), clubId).orElse(null);
            if (m == null) return ResponseEntity.status(403).build();
            isBaskan = "baskan".equalsIgnoreCase(m.getRole());
            
            // If not baskan, check if they are a leader of the target team
            if (!isBaskan) {
                if ("EKIP".equalsIgnoreCase(report.getType())) {
                    if (report.getTeam() == null) return ResponseEntity.badRequest().build();
                    boolean isLeaderOfThisTeam = teamMemberRepository.findByMembershipId(m.getId()).stream()
                            .anyMatch(tm -> tm.getTeam().getId().equals(report.getTeam().getId()) && "EKIP_LIDERI".equalsIgnoreCase(tm.getRole()));
                    if (!isLeaderOfThisTeam) return ResponseEntity.status(403).build();
                } else {
                    // Non-baskan cannot make General announcements
                    return ResponseEntity.status(403).build();
                }
            }
        }

        return clubService.getClubById(clubId).map(club -> {
            report.setClub(club);
            report.setStatus("DUYURU");
            return ResponseEntity.ok(meetingReportService.saveReport(report));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/report")
    public ResponseEntity<MeetingReport> addReport(@PathVariable Long clubId, @PathVariable Long id, @RequestBody MeetingReport reportData) {
        UserPrincipal up = getPrincipal();
        if (up == null) return ResponseEntity.status(401).build();

        boolean isClubLogin = up.getId() < 0;
        
        return meetingReportService.getReportsByClubId(clubId).stream()
            .filter(meeting -> meeting.getId().equals(id))
            .findFirst()
            .map(meeting -> {
                if (!isClubLogin) {
                    Membership m = memberService.findByUserIdAndClubId(up.getId(), clubId).orElse(null);
                    if (m == null) return ResponseEntity.status(403).<MeetingReport>build();
                    
                    boolean isBaskan = "baskan".equalsIgnoreCase(m.getRole());
                    boolean isAuthorized = isBaskan;
                    
                    if (!isAuthorized && meeting.getTeam() != null) {
                        isAuthorized = teamMemberRepository.findByTeamIdAndMembershipId(meeting.getTeam().getId(), m.getId()).isPresent();
                    } else if (!isAuthorized) {
                        isAuthorized = "active".equalsIgnoreCase(m.getStatus());
                    }

                    if (!isAuthorized) return ResponseEntity.status(403).<MeetingReport>build();
                }

                meeting.setContent(reportData.getContent());
                meeting.setAttendees(reportData.getAttendees());
                meeting.setFileName(reportData.getFileName());
                meeting.setFileData(reportData.getFileData());
                meeting.setStatus("RAPORLANDI");
                return ResponseEntity.ok(meetingReportService.saveReport(meeting));
            }).orElse(ResponseEntity.<MeetingReport>notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        meetingReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    private UserPrincipal getPrincipal() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal) return (UserPrincipal) principal;
        return null;
    }
}
