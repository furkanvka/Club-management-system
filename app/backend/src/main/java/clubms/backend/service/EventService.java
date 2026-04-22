package clubms.backend.service;

import clubms.backend.entity.Event;
import clubms.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getEventsByClubId(Long clubId) {
        return eventRepository.findByClubId(clubId);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public boolean hasCollision(Event event) {
        if (event.getEventDate() == null || event.getLocation() == null) return false;
        
        // Find all events on the same day and location (simplified check)
        List<Event> allEvents = eventRepository.findAll();
        return allEvents.stream()
            .filter(e -> !e.getId().equals(event.getId())) // exclude current event
            .anyMatch(e -> 
                e.getEventDate() != null && 
                e.getEventDate().toLocalDate().equals(event.getEventDate().toLocalDate()) &&
                e.getLocation() != null &&
                e.getLocation().equalsIgnoreCase(event.getLocation())
            );
    }

    public Event createEvent(Event event) {
        if (hasCollision(event)) {
            // We can throw an exception or handle it in the controller, but let's just save for now 
            // and maybe return a warning or have the controller check.
            // Requirement says "Return specific error code", so throwing exception is better.
            throw new RuntimeException("COLLISION: An event already exists at this date and location.");
        }
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
