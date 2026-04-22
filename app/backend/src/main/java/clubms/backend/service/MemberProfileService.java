package clubms.backend.service;

import clubms.backend.entity.MemberProfile;
import clubms.backend.repository.MemberProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MemberProfileService {

    @Autowired
    private MemberProfileRepository memberProfileRepository;

    public Optional<MemberProfile> getProfileByMembershipId(Long membershipId) {
        return memberProfileRepository.findByMembershipId(membershipId);
    }

    public MemberProfile saveProfile(MemberProfile profile) {
        return memberProfileRepository.save(profile);
    }
}
