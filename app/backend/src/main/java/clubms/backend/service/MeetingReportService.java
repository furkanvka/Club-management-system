package clubms.backend.service;

import clubms.backend.entity.MeetingReport;
import clubms.backend.repository.MeetingReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingReportService {

    @Autowired
    private MeetingReportRepository meetingReportRepository;

    public List<MeetingReport> getReportsByClubId(Long clubId) {
        return meetingReportRepository.findByClubId(clubId);
    }

    public MeetingReport saveReport(MeetingReport report) {
        return meetingReportRepository.save(report);
    }

    public void deleteReport(Long id) {
        meetingReportRepository.deleteById(id);
    }
}
