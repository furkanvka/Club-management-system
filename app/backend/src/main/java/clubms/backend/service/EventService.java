package clubms.backend.service;

import clubms.backend.entity.Event;
import clubms.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        
        LocalDateTime newStart = event.getEventDate();
        // Assume each event takes roughly 2 hours for collision checking
        LocalDateTime newEnd = newStart.plusHours(2);

        List<Event> allEvents = eventRepository.findAll();
        return allEvents.stream()
            .filter(e -> e.getId() != null && !e.getId().equals(event.getId()))
            .filter(e -> e.getLocation() != null && e.getLocation().equalsIgnoreCase(event.getLocation()))
            .anyMatch(e -> {
                LocalDateTime existingStart = e.getEventDate();
                if (existingStart == null) return false;
                LocalDateTime existingEnd = existingStart.plusHours(2);
                
                // Check for overlap: (StartA < EndB) and (EndA > StartB)
                return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
            });
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
