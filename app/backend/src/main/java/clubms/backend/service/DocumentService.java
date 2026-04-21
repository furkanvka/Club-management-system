package clubms.backend.service;

import clubms.backend.entity.Document;
import clubms.backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public List<Document> getDocumentsByClubId(Long clubId) {
        return documentRepository.findByClubId(clubId);
    }

    public Document saveDocumentInfo(Document document) {
        return documentRepository.save(document);
    }
}
