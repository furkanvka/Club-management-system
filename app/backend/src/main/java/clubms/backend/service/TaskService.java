package clubms.backend.service;

import clubms.backend.entity.Task;
import clubms.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {
    @Autowired private TaskRepository taskRepository;

    public List<Task> getTasksByProjectId(Long projectId) { return taskRepository.findByProjectId(projectId); }
    public Task createTask(Task task) { return taskRepository.save(task); }
    public Task updateTask(Task task) { return taskRepository.save(task); }
    public void deleteTask(Long id) { taskRepository.deleteById(id); }
}
