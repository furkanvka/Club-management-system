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

    public Task createTask(Task task, Long requesterMembershipId) {
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

        // Görevi yapan kişi veya lider durumu güncelleyebilir
        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(requesterMembershipId);
        boolean isLeader = task.getProject().getTeam().getLeader().getId().equals(requesterMembershipId);

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
        if (!task.getProject().getTeam().getLeader().getId().equals(requesterMembershipId)) {
            throw new RuntimeException("Sadece ekip lideri görev silebilir.");
        }

        taskRepository.deleteById(id);
    }
}
