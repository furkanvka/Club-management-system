package clubms.backend.service;

import clubms.backend.entity.Club;
import clubms.backend.repository.ClubRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClubServiceTest {

    @Mock
    private ClubRepository clubRepository;

    @InjectMocks
    private ClubService clubService;

    private Club sampleClub;

    @BeforeEach
    void setUp() {
        sampleClub = new Club();
        sampleClub.setId(1L);
        sampleClub.setName("Software Club");
        sampleClub.setDescription("A club for software developers");
    }

    @Test
    void getAllClubs_ReturnsList() {
        Club club2 = new Club();
        club2.setId(2L);
        club2.setName("Hardware Club");

        when(clubRepository.findAll()).thenReturn(Arrays.asList(sampleClub, club2));

        List<Club> result = clubService.getAllClubs();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Software Club", result.get(0).getName());
        verify(clubRepository, times(1)).findAll();
    }

    @Test
    void getClubById_ReturnsClub_WhenClubExists() {
        when(clubRepository.findById(1L)).thenReturn(Optional.of(sampleClub));

        Optional<Club> result = clubService.getClubById(1L);

        assertTrue(result.isPresent());
        assertEquals("Software Club", result.get().getName());
        verify(clubRepository, times(1)).findById(1L);
    }

    @Test
    void getClubById_ReturnsEmpty_WhenClubDoesNotExist() {
        when(clubRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Club> result = clubService.getClubById(99L);

        assertFalse(result.isPresent());
        verify(clubRepository, times(1)).findById(99L);
    }

    @Test
    void createClub_ReturnsSavedClub() {
        when(clubRepository.save(any(Club.class))).thenReturn(sampleClub);

        Club newClub = new Club();
        newClub.setName("Software Club");
        
        Club result = clubService.createClub(newClub);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Software Club", result.getName());
        verify(clubRepository, times(1)).save(newClub);
    }
}
