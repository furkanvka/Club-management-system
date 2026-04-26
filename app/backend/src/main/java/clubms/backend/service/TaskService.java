package clubms.backend.service;

import clubms.backend.entity.Task;
import clubms.backend.entity.Project;
import clubms.backend.entity.Team;
import clubms.backend.repository.TaskRepository;
import clubms.backend.repository.ProjectRepository;
import clubms.backend.repository.TeamMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class TaskService {
    @Autowired private TaskRepository taskRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;

    public List<Task> getTasksByProjectId(Long projectId) { 
        return taskRepository.findByProjectId(projectId); 
    }

    public List<Task> getTasksByEventId(Long eventId) {
        return taskRepository.findByEventId(eventId);
    }

    public List<Task> getTasksByAssignedToId(Long membershipId) {
        return taskRepository.findByAssignedToId(membershipId);
    }

    @Autowired private clubms.backend.repository.MembershipRepository membershipRepository;

    public Task createTask(Task task, Long requesterMembershipId) {
        if (task.getAssignedTo() != null && task.getAssignedTo().getId() != null) {
            clubms.backend.entity.Membership assignedMember = membershipRepository.findById(task.getAssignedTo().getId()).orElse(null);
            if (assignedMember != null && ("baskan".equalsIgnoreCase(assignedMember.getRole()) || "kulup_baskani".equalsIgnoreCase(assignedMember.getRole()))) {
                throw new RuntimeException("Kulüp başkanı görev alamaz.");
            }
        }

        if (task.getProject() != null) {
            Project project = projectRepository.findById(task.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Proje bulunamadı"));

            Team team = project.getTeam();

            // 1. Sadece ekip lideri görev atayabilir
            if (!team.getLeader().getId().equals(requesterMembershipId)) {
                throw new RuntimeException("Sadece ekip lideri görev atayabilir.");
            }

            // 2. Görev atanan kişi bu ekipte mi?
            if (task.getAssignedTo() != null) {
                teamMemberRepository.findByTeamIdAndMembershipId(team.getId(), task.getAssignedTo().getId())
                        .orElseThrow(() -> new RuntimeException("Görev sadece ekip üyelerine atanabilir."));
            }
        } else if (task.getEvent() != null) {
            // Controller will set the event, and it already checks if the requester is the responsible person.
        } else {
            throw new RuntimeException("Görev bir proje veya etkinliğe ait olmalıdır.");
        }

        // 3. Son tarih (deadline) kontrolü
        if (task.getDueDate() == null) {
            throw new RuntimeException("Görev için son tarih (due date) belirtilmelidir.");
        }

        // 4. Öncelik sırası kontrolü (low, normal, high) - TR: düşük, orta, yüksek
        // Entity'de 'normal' varsayılan, biz dışarıdan 'low', 'normal', 'high' bekliyoruz.
        if (task.getPriority() == null) {
            task.setPriority("normal");
        }

        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long taskId, String status, Long requesterMembershipId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Görev bulunamadı"));

        // Görevi yapan kişi veya (Proje lideri / Etkinlik sorumlusu) durumu güncelleyebilir
        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(requesterMembershipId);
        boolean isLeader = false;
        if (task.getProject() != null) {
            isLeader = task.getProject().getTeam().getLeader().getId().equals(requesterMembershipId);
        } else if (task.getEvent() != null) {
            isLeader = task.getEvent().getResponsible() != null && task.getEvent().getResponsible().getId().equals(requesterMembershipId);
        }

        if (!isAssigned && !isLeader) {
            throw new RuntimeException("Bu işlem için yetkiniz yok.");
        }

        if (status.equals("completed")) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }
        
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id, Long requesterMembershipId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Görev bulunamadı"));

        // Sadece lider silebilir
        boolean canDelete = false;
        if (task.getProject() != null) {
            canDelete = task.getProject().getTeam().getLeader().getId().equals(requesterMembershipId);
        } else if (task.getEvent() != null) {
            canDelete = task.getEvent().getResponsible() != null && task.getEvent().getResponsible().getId().equals(requesterMembershipId);
        }

        if (!canDelete) {
            throw new RuntimeException("Sadece ekip lideri görev silebilir.");
        }

        taskRepository.deleteById(id);
    }
}
