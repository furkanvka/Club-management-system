package clubms.backend.service;

import clubms.backend.entity.Transaction;
import clubms.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FinanceService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getTransactionsByClubId(Long clubId) {
        return transactionRepository.findByClubId(clubId);
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
}
