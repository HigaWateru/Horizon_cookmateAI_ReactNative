package demo.server.service;

import demo.server.dto.BudgetSummaryResponse;
import demo.server.dto.TransactionRequest;
import demo.server.dto.TransactionResponse;
import demo.server.model.User;

import java.util.List;

public interface TransactionService {
    TransactionResponse create(TransactionRequest request, User currentUser);
    TransactionResponse update(String id, TransactionRequest request, User currentUser);
    void delete(String id, User currentUser);
    List<TransactionResponse> getAll(User currentUser);
    BudgetSummaryResponse getSummary(User currentUser);
}
