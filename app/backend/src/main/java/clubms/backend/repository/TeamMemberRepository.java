package clubms.backend.repository;

import clubms.backend.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamId(Long teamId);
    Optional<TeamMember> findByTeamIdAndMembershipId(Long teamId, Long membershipId);
}
