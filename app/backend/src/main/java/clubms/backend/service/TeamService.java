package clubms.backend.service;

import clubms.backend.entity.*;
import clubms.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class TeamService {
    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMemberRepository teamMemberRepository;
    @Autowired private MembershipRepository membershipRepository;

    public List<Team> getTeamsByClubId(Long clubId) {
        return teamRepository.findByClubId(clubId);
    }

    public List<Team> getTeamsByMembershipId(Long clubId, Long membershipId) {
        Membership m = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Üyelik bulunamadı"));
        
        if ("baskan".equalsIgnoreCase(m.getRole())) {
            return teamRepository.findByClubId(clubId);
        }

        // 1. Üyesi olduğu ekipler
        Set<Team> teams = teamMemberRepository.findByMembershipId(membershipId).stream()
                .map(TeamMember::getTeam)
                .collect(Collectors.toSet());

        // 2. Lideri olduğu ekipler
        teams.addAll(teamRepository.findByLeaderId(membershipId));

        // ClubId'ye göre filtrele (Controller'dan gelen clubId)
        return teams.stream()
                .filter(t -> t.getClub().getId().equals(clubId))
                .collect(Collectors.toList());
    }

    public Team createTeam(Team team) {
        // Ekip oluşturulduğunda liderin rolünü 'ekip-lideri' olarak güncelle
        if (team.getLeader() != null && team.getLeader().getId() != null) {
            Membership leaderMembership = membershipRepository.findById(team.getLeader().getId())
                    .orElseThrow(() -> new RuntimeException("Lider üyeliği bulunamadı"));
            
            // Üyenin zaten bir ekipte olup olmadığını kontrol et
            boolean alreadyInTeam = teamMemberRepository.findByMembershipId(leaderMembership.getId()).stream()
                    .anyMatch(tm -> tm.getTeam().getClub().getId().equals(team.getClub().getId()));
            if (alreadyInTeam) {
                throw new RuntimeException("Bu üye zaten bu kulüpte başka bir ekibin parçasıdır.");
            }

            leaderMembership.setRole("ekip_lideri");
            leaderMembership.setStatus("active");
            membershipRepository.save(leaderMembership);
            
            // Team objesindeki leader referansını güncelle
            team.setLeader(leaderMembership);
        }
        
        Team savedTeam = teamRepository.save(team);

        // Lideri aynı zamanda TeamMember tablosuna EKIP_LIDERI olarak ekle
        if (savedTeam.getLeader() != null) {
            TeamMember leaderMember = new TeamMember();
            leaderMember.setTeam(savedTeam);
            leaderMember.setMembership(savedTeam.getLeader());
            leaderMember.setRole("EKIP_LIDERI");
            leaderMember.setStatus("AKTIF");
            teamMemberRepository.save(leaderMember);
        }

        return savedTeam;
    }

    public void deleteTeam(Long id) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(id);
        for (TeamMember tm : members) {
            Membership m = tm.getMembership();
            m.setStatus("passive");
            m.setRole("uye");
            membershipRepository.save(m);
        }
        teamRepository.deleteById(id);
    }

    @Autowired private TaskRepository taskRepository;
    @Autowired private MeetingReportRepository meetingReportRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private ProjectRepository projectRepository;

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    // Üyenin ekipteki geçmişini ve performansını getir
    public Map<String, Object> getMemberHistory(Long teamId, Long membershipId) {
        List<Task> memberTasks = taskRepository.findByAssignedToId(membershipId).stream()
                .filter(t -> t.getProject().getTeam().getId().equals(teamId))
                .collect(Collectors.toList());

        long completedCount = memberTasks.stream().filter(t -> "completed".equals(t.getStatus())).count();
        long totalCount = memberTasks.size();
        
        Map<String, Object> history = new HashMap<>();
        history.put("tasks", memberTasks);
        history.put("totalTasks", totalCount);
        history.put("completedTasks", completedCount);
        history.put("performanceScore", totalCount == 0 ? 0 : (completedCount * 100) / totalCount);
        
        return history;
    }

    // Ekip performans istatistiklerini hesapla
    public Map<String, Object> getTeamPerformance(Long teamId) {
        List<Project> teamProjects = projectRepository.findByTeamId(teamId);
        List<Task> allTasks = teamProjects.stream()
                .flatMap(p -> taskRepository.findByProjectId(p.getId()).stream())
                .collect(Collectors.toList());

        long completed = allTasks.stream().filter(t -> "completed".equals(t.getStatus())).count();
        long overdue = allTasks.stream()
                .filter(t -> !"completed".equals(t.getStatus()) && t.getDueDate().isBefore(LocalDate.now()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("projectCount", teamProjects.size());
        stats.put("totalTasks", allTasks.size());
        stats.put("completedTasks", completed);
        stats.put("overdueTasks", overdue);
        stats.put("completionRate", allTasks.isEmpty() ? 0 : (completed * 100) / allTasks.size());
        
        return stats;
    }

    // Ekibe özel toplantı raporları
    public List<MeetingReport> getTeamMeetings(Long teamId) {
        return meetingReportRepository.findByTeamId(teamId);
    }

    // Ekibe özel dokümanlar
    public List<Document> getTeamDocuments(Long teamId) {
        return documentRepository.findByTeamId(teamId);
    }

    public List<Team> getMyTeams(Long membershipId) {
        // 1. Üyesi olduğu ekipler
        Set<Team> teams = teamMemberRepository.findByMembershipId(membershipId).stream()
                .map(TeamMember::getTeam)
                .collect(Collectors.toSet());
        
        // 2. Lideri olduğu ekipler
        teams.addAll(teamRepository.findByLeaderId(membershipId));

        // Lider bilgisini zorla yükle (Lazy loading sorununu önlemek için)
        for (Team t : teams) {
            if (t.getLeader() != null) {
                t.getLeader().getId(); 
            }
        }
        return new ArrayList<>(teams);
    }

    public TeamMember addTeamMember(Long teamId, Long membershipId, Long requesterMembershipId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Ekip bulunamadı"));

        // SADECE Ekip Lideri üye ekleyebilir (Başkan yetkisi kaldırıldı)
        if (!team.getLeader().getId().equals(requesterMembershipId)) {
            throw new RuntimeException("Bu işlem için yetkiniz yok. Sadece ilgili ekibin lideri üye ekleyebilir.");
        }

        // Üye zaten bu kulüpte herhangi bir ekipte mi kontrolü
        boolean alreadyInAnyTeam = teamMemberRepository.findByMembershipId(membershipId).stream()
                .anyMatch(existingTm -> existingTm.getTeam().getClub().getId().equals(team.getClub().getId()));
        
        if (alreadyInAnyTeam) {
            throw new RuntimeException("Bu üye zaten bu kulüpte bir ekibe dahil.");
        }

        Membership memberToUpdate = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Üye bulunamadı"));

        // Üyenin genel rolünü ve durumunu güncelle
        memberToUpdate.setRole("ekip_uyesi");
        memberToUpdate.setStatus("active");
        membershipRepository.save(memberToUpdate);

        // Ekip üyesi olarak kaydet
        TeamMember tm = new TeamMember();
        tm.setTeam(team);
        tm.setMembership(memberToUpdate);
        tm.setRole("EKIP_UYESI");
        tm.setStatus("AKTIF");
        
        return teamMemberRepository.save(tm);
    }

    public void removeTeamMember(Long id, Long requesterMembershipId) {
        TeamMember tm = teamMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ekip üyesi bulunamadı"));
        
        Team team = tm.getTeam();
        
        // SADECE Ekip Lideri üye çıkarabilir (Başkan yetkisi kaldırıldı)
        if (!team.getLeader().getId().equals(requesterMembershipId)) {
            throw new RuntimeException("Bu işlem için yetkiniz yok. Sadece ilgili ekibin lideri üye çıkarabilir.");
        }

        // Üyenin durumunu sıfırla
        Membership m = tm.getMembership();
        m.setStatus("passive");
        m.setRole("uye");
        membershipRepository.save(m);

        teamMemberRepository.deleteById(id);
    }
}
