package clubms.backend.service;

import clubms.backend.entity.Membership;
import clubms.backend.repository.MembershipRepository;
import clubms.backend.repository.TeamMemberRepository;
import clubms.backend.repository.EventApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private EventApplicationRepository eventApplicationRepository;

    @Autowired
    private clubms.backend.repository.EventStaffRepository eventStaffRepository;

    @Autowired
    private clubms.backend.repository.TaskRepository taskRepository;

    public clubms.backend.dto.response.MemberHistoryResponse getMemberHistory(Long membershipId) {
        return new clubms.backend.dto.response.MemberHistoryResponse(
            teamMemberRepository.findByMembershipId(membershipId),
            eventStaffRepository.findByMembershipId(membershipId),
            eventApplicationRepository.findByMembershipId(membershipId),
            taskRepository.findByAssignedToId(membershipId)
        );
    }

    public List<Membership> getMembersByClubId(Long clubId) {
        List<Membership> memberships = membershipRepository.findByClubId(clubId);
        memberships.forEach(this::calculateDynamicStatus);
        return memberships;
    }

    public List<Membership> getMembershipsByUserId(Long userId) {
        List<Membership> memberships = membershipRepository.findByUserId(userId);
        memberships.forEach(this::calculateDynamicStatus);
        return memberships;
    }

    private void calculateDynamicStatus(Membership m) {
        // Başkanlar her zaman aktiftir
        if ("baskan".equals(m.getRole())) {
            m.setStatus("active");
            return;
        }

        // Bir ekipte üyeliği var mı?
        boolean inTeam = !teamMemberRepository.findByMembershipId(m.getId()).isEmpty();
        
        // Etkinlik başvurusu var mı?
        boolean inEvent = !eventApplicationRepository.findByMembershipId(m.getId()).isEmpty();

        if (inTeam || inEvent) {
            m.setStatus("active");
        } else {
            m.setStatus("passive");
        }
    }

    public Membership createMembership(Membership membership) {
        // Yeni üyelik varsayılan olarak pasiftir (henüz bir ekipte değil)
        if (!"baskan".equals(membership.getRole())) {
            membership.setStatus("passive");
        }
        return membershipRepository.save(membership);
    }

    public Optional<Membership> getMembershipById(Long id) {
        return membershipRepository.findById(id);
    }

    public Optional<Membership> findByUserIdAndClubId(Long userId, Long clubId) {
        return membershipRepository.findByUserIdAndClubId(userId, clubId);
    }

    public Membership updateMembershipFlags(Long membershipId, String flags) {
        return membershipRepository.findById(membershipId).map(membership -> {
            membership.setFlags(flags);
            return membershipRepository.save(membership);
        }).orElseThrow(() -> new RuntimeException("Membership not found"));
    }

    public Membership updateRole(Long membershipId, String role) {
        return membershipRepository.findById(membershipId).map(membership -> {
            // JSON'dan gelebilecek olası tırnakları temizle
            String cleanRole = role.replace("\"", "");
            membership.setRole(cleanRole);
            return membershipRepository.save(membership);
        }).orElseThrow(() -> new RuntimeException("Membership not found"));
    }

    public void deleteMembership(Long membershipId) {
        membershipRepository.deleteById(membershipId);
    }
}
