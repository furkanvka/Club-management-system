package clubms.backend.service;

import clubms.backend.entity.EventApplication;
import clubms.backend.repository.EventApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventApplicationService {

    @Autowired
    private EventApplicationRepository eventApplicationRepository;

    public List<EventApplication> getApplicationsByEventId(Long eventId) {
        return eventApplicationRepository.findByEventId(eventId);
    }

    public Optional<EventApplication> getApplication(Long eventId, Long membershipId) {
        return eventApplicationRepository.findByEventIdAndMembershipId(eventId, membershipId);
    }

    public EventApplication saveApplication(EventApplication application) {
        return eventApplicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        eventApplicationRepository.deleteById(id);
    }

    public Optional<EventApplication> getById(Long id) {
        return eventApplicationRepository.findById(id);
    }
}
