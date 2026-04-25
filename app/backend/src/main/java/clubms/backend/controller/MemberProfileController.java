package clubms.backend.controller;

import clubms.backend.entity.MemberProfile;
import clubms.backend.service.MemberProfileService;
import clubms.backend.service.MemberService;
import clubms.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clubs/{clubId}/members/me/profile")
public class MemberProfileController {

    @Autowired
    private MemberProfileService memberProfileService;

    @Autowired
    private MemberService memberService;

    @GetMapping
    public ResponseEntity<MemberProfile> getMyProfile(@PathVariable Long clubId) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return memberService.getMembershipsByUserId(userPrincipal.getId()).stream()
                .filter(m -> m.getClub().getId().equals(clubId))
                .findFirst()
                .map(membership -> memberProfileService.getProfileByMembershipId(membership.getId())
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.noContent().build()))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping
    public ResponseEntity<MemberProfile> updateMyProfile(@PathVariable Long clubId, @RequestBody MemberProfile profileRequest) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return memberService.getMembershipsByUserId(userPrincipal.getId()).stream()
                .filter(m -> m.getClub().getId().equals(clubId))
                .findFirst()
                .map(membership -> {
                    MemberProfile profile = memberProfileService.getProfileByMembershipId(membership.getId())
                            .orElse(new MemberProfile());
                    profile.setMembership(membership);
                    profile.setFullName(profileRequest.getFullName());
                    profile.setStudentNumber(profileRequest.getStudentNumber());
                    profile.setPhone(profileRequest.getPhone());
                    profile.setDepartment(profileRequest.getDepartment());
                    profile.setClassYear(profileRequest.getClassYear());
                    profile.setAvatarUrl(profileRequest.getAvatarUrl());
                    return ResponseEntity.ok(memberProfileService.saveProfile(profile));
                })
                .orElse(ResponseEntity.status(401).build());
    }
}
