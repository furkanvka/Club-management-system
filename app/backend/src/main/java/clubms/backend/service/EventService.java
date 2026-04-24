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

    @Autowired
    private clubms.backend.repository.EventStaffRepository eventStaffRepository;

    public List<Event> getEventsByClubId(Long clubId) {
        return eventRepository.findByClubId(clubId);
    }

    public List<Event> getEventsByResponsibleId(Long membershipId) {
        return eventRepository.findByResponsibleId(membershipId);
    }

    public List<clubms.backend.entity.EventStaff> getEventStaff(Long eventId) {
        return eventStaffRepository.findByEventId(eventId);
    }

    public clubms.backend.entity.EventStaff addStaff(clubms.backend.entity.EventStaff staff) {
        return eventStaffRepository.save(staff);
    }

    public void removeStaff(Long staffId) {
        eventStaffRepository.deleteById(staffId);
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
        if (event.getCapacity() != null && event.getCapacity() < 0) {
            throw new RuntimeException("Kapasite negatif olamaz.");
        }
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
