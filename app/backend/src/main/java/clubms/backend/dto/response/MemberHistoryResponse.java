package clubms.backend.dto.response;

import clubms.backend.entity.TeamMember;
import clubms.backend.entity.EventStaff;
import clubms.backend.entity.EventApplication;
import clubms.backend.entity.Task;
import java.util.List;

public class MemberHistoryResponse {
    private List<TeamMember> teams;
    private List<EventStaff> events;
    private List<EventApplication> applications;
    private List<Task> tasks;

    public MemberHistoryResponse(List<TeamMember> teams, List<EventStaff> events, List<EventApplication> applications, List<Task> tasks) {
        this.teams = teams;
        this.events = events;
        this.applications = applications;
        this.tasks = tasks;
    }

    // Getters and Setters
    public List<TeamMember> getTeams() { return teams; }
    public void setTeams(List<TeamMember> teams) { this.teams = teams; }
    public List<EventStaff> getEvents() { return events; }
    public void setEvents(List<EventStaff> events) { this.events = events; }
    public List<EventApplication> getApplications() { return applications; }
    public void setApplications(List<EventApplication> applications) { this.applications = applications; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}
