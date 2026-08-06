package demo.server.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    long totalIngredients;
    long expiringIngredientsCount;
    long expiredIngredientsCount;
    BigDecimal totalIngredientValue;
    BigDecimal budgetLimit;
    BigDecimal totalSpent;
    BigDecimal remainingBudget;
    String budgetStatus; // "NORMAL", "WARNING", "EXCEEDED"
    BigDecimal wastedValueEstimation;

    List<GroupStats> categorySpentBreakdown;
    List<GroupStats> storageLocationBreakdown;
    List<GroupStats> categoryIngredientBreakdown;
    List<DaySpend> dailySpendHistory;
    List<MonthSpend> monthlySpendHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class GroupStats {
        String name;
        long count;
        BigDecimal amount;
        double percentage;
        String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DaySpend {
        LocalDate date;
        BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthSpend {
        String month;
        BigDecimal amount;
    }
}
