package clubms.backend.service;

import clubms.backend.entity.Membership;
import clubms.backend.repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MembershipRepository membershipRepository;

    public List<Membership> getMembersByClubId(Long clubId) {
        return membershipRepository.findByClubId(clubId);
    }

    public List<Membership> getMembershipsByUserId(Long userId) {
        return membershipRepository.findByUserId(userId);
    }

    public Membership createMembership(Membership membership) {
        return membershipRepository.save(membership);
    }

    public Optional<Membership> getMembershipById(Long id) {
        return membershipRepository.findById(id);
    }

    public Membership updateMembershipFlags(Long membershipId, String flags) {
        return membershipRepository.findById(membershipId).map(membership -> {
            membership.setFlags(flags);
            return membershipRepository.save(membership);
        }).orElseThrow(() -> new RuntimeException("Membership not found"));
    }

    public void deleteMembership(Long membershipId) {
        membershipRepository.deleteById(membershipId);
    }
}
