package clubms.backend.controller;

import clubms.backend.entity.Transaction;
import clubms.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs/{clubId}/transactions")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable Long clubId) {
        return ResponseEntity.ok(financeService.getTransactionsByClubId(clubId));
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@PathVariable Long clubId, @RequestBody Transaction transaction) {
        return clubService.getClubById(clubId).map(club -> {
            transaction.setClub(club);
            return ResponseEntity.ok(financeService.createTransaction(transaction));
        }).orElse(ResponseEntity.notFound().build());
    }
}
