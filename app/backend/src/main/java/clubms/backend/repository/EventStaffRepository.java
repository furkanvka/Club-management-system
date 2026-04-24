package clubms.backend.repository;

import clubms.backend.entity.EventStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventStaffRepository extends JpaRepository<EventStaff, Long> {
    List<EventStaff> findByEventId(Long eventId);
    List<EventStaff> findByMembershipId(Long membershipId);
}
