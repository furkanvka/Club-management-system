package clubms.backend.repository;

import clubms.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByClubId(Long clubId);
    List<Document> findByTeamId(Long teamId);
}
