package clubms.backend.controller;

import clubms.backend.entity.Transaction;
import clubms.backend.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/clubs/{clubId}/transactions")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @Autowired
    private clubms.backend.service.ClubService clubService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long clubId) {
        List<Transaction> txs = financeService.getTransactionsByClubId(clubId);
        BigDecimal income = txs.stream()
            .filter(t -> "income".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal expense = txs.stream()
            .filter(t -> "expense".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", income);
        summary.put("totalExpense", expense);
        summary.put("balance", income.subtract(expense));
        summary.put("count", txs.size());
        
        return ResponseEntity.ok(summary);
    }

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
