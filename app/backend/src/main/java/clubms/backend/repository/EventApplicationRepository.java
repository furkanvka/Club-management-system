package clubms.backend.repository;

import clubms.backend.entity.EventApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventApplicationRepository extends JpaRepository<EventApplication, Long> {
    List<EventApplication> findByEventId(Long eventId);
    List<EventApplication> findByMembershipId(Long membershipId);
    Optional<EventApplication> findByEventIdAndMembershipId(Long eventId, Long membershipId);
}
