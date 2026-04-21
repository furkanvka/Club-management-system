package clubms.backend.security;

import clubms.backend.entity.User;
import clubms.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserPrincipal.create(user);
    }

    @Autowired
    private clubms.backend.repository.ClubRepository clubRepository;

    public UserDetails loadUserById(Long id) {
        if (id < 0) {
            clubms.backend.entity.Club club = clubRepository.findById(-id)
                    .orElseThrow(() -> new UsernameNotFoundException("Club not found with id: " + -id));
            return new UserPrincipal(id, club.getContactEmail(), club.getPassword(), 
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CLUB")));
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return UserPrincipal.create(user);
    }
}
