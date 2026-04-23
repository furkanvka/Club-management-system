package clubms.backend.repository;

import clubms.backend.entity.MeetingReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingReportRepository extends JpaRepository<MeetingReport, Long> {
    List<MeetingReport> findByClubId(Long clubId);
    List<MeetingReport> findByTeamId(Long teamId);
}
