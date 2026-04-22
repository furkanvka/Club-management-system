package clubms.backend.repository;

import clubms.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClubId(Long clubId);
    List<Project> findByTeamId(Long teamId);
    Optional<Project> findByIdAndClubId(Long id, Long clubId);
}
