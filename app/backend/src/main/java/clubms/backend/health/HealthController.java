package clubms.backend.health;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Simple health endpoint exposing application status.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
