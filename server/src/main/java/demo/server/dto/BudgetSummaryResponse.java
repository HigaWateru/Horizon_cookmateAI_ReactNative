package demo.server.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetSummaryResponse {
    String monthLabel;
    BigDecimal budgetLimit;
    BigDecimal spent;
    long daysLeft;
    List<BudgetSuggestion> suggestions;
    List<BudgetCategory> categories;
    List<TransactionResponse> expenses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class BudgetSuggestion {
        String id;
        String name;
        String costLabel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class BudgetCategory {
        String id;
        String name;
        BigDecimal amount;
        String icon;
    }
}
