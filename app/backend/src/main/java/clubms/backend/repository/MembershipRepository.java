package clubms.backend.repository;

import clubms.backend.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    List<Membership> findByClubId(Long clubId);
    List<Membership> findByUserId(Long userId);
    Optional<Membership> findByUserIdAndClubId(Long userId, Long clubId);
}
