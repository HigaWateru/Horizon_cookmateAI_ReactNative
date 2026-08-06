package demo.server.service.impl;

import demo.server.dto.DashboardStatsResponse;
import demo.server.model.Ingredient;
import demo.server.model.Transaction;
import demo.server.model.User;
import demo.server.repository.IngredientRepository;
import demo.server.repository.TransactionRepository;
import demo.server.service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    IngredientRepository ingredientRepository;
    TransactionRepository transactionRepository;

    @Override
    public DashboardStatsResponse getStatistics(User currentUser) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        // 1. Fetch data
        List<Ingredient> ingredients = ingredientRepository.findByUser(currentUser);
        List<Transaction> allTransactions = transactionRepository.findByUserOrderByDateDesc(currentUser);

        // Filter transactions for the current month
        List<Transaction> monthTransactions = allTransactions.stream()
                .filter(t -> !t.getDate().isBefore(startOfMonth) && !t.getDate().isAfter(endOfMonth))
                .collect(Collectors.toList());

        // 2. Compute Ingredient KPIs
        long totalIngredients = ingredients.size();
        long expiringCount = 0;
        long expiredCount = 0;
        BigDecimal totalIngredientValue = BigDecimal.ZERO;
        BigDecimal wastedValueEstimation = BigDecimal.ZERO;

        for (Ingredient i : ingredients) {
            long daysLeft = ChronoUnit.DAYS.between(today, i.getExpiryDate());
            if (daysLeft < 0) {
                expiredCount++;
                if (i.getPrice() != null) {
                    wastedValueEstimation = wastedValueEstimation.add(i.getPrice());
                }
            } else if (daysLeft <= 3) {
                expiringCount++;
                if (i.getPrice() != null) {
                    wastedValueEstimation = wastedValueEstimation.add(i.getPrice());
                }
            }

            if (i.getPrice() != null) {
                totalIngredientValue = totalIngredientValue.add(i.getPrice());
            }
        }

        // 3. Compute Budget & Spend KPIs
        BigDecimal budgetLimit = currentUser.getMonthlyBudget() != null ? currentUser.getMonthlyBudget() : new BigDecimal("1500000");
        BigDecimal totalSpent = monthTransactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingBudget = budgetLimit.subtract(totalSpent);

        String budgetStatus = "NORMAL";
        if (totalSpent.compareTo(budgetLimit) > 0) {
            budgetStatus = "EXCEEDED";
        } else if (totalSpent.compareTo(budgetLimit.multiply(new BigDecimal("0.7"))) >= 0) {
            budgetStatus = "WARNING";
        }

        // 4. Storage Location Breakdown
        Map<String, Long> storageCounts = ingredients.stream()
                .collect(Collectors.groupingBy(Ingredient::getStorageLocation, Collectors.counting()));
        List<DashboardStatsResponse.GroupStats> storageLocationBreakdown = new ArrayList<>();
        storageCounts.forEach((location, count) -> {
            String icon = "❄️";
            if ("Ngăn đá".equalsIgnoreCase(location)) {
                icon = "🧊";
            } else if ("Bên ngoài".equalsIgnoreCase(location) || "Tủ bếp".equalsIgnoreCase(location)) {
                icon = "🧺";
            }
            storageLocationBreakdown.add(DashboardStatsResponse.GroupStats.builder()
                    .name(location)
                    .count(count)
                    .icon(icon)
                    .build());
        });

        // 5. Ingredient Category Breakdown
        Map<String, Long> ingredientCategoryCounts = ingredients.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getCategory() != null ? i.getCategory() : "Khác",
                        Collectors.counting()
                ));
        List<DashboardStatsResponse.GroupStats> categoryIngredientBreakdown = new ArrayList<>();
        ingredientCategoryCounts.forEach((category, count) -> {
            String icon = getIngredientCategoryIcon(category);
            categoryIngredientBreakdown.add(DashboardStatsResponse.GroupStats.builder()
                    .name(category)
                    .count(count)
                    .icon(icon)
                    .build());
        });

        // 6. Expense Category Breakdown (Current Month)
        Map<String, BigDecimal> expenseCategorySums = new LinkedHashMap<>();
        expenseCategorySums.put("Nguyên liệu", BigDecimal.ZERO);
        expenseCategorySums.put("Đặt đồ ăn", BigDecimal.ZERO);
        expenseCategorySums.put("Ăn ngoài", BigDecimal.ZERO);
        expenseCategorySums.put("Gia vị", BigDecimal.ZERO);

        for (Transaction t : monthTransactions) {
            String cat = t.getCategory();
            if (expenseCategorySums.containsKey(cat)) {
                expenseCategorySums.put(cat, expenseCategorySums.get(cat).add(t.getAmount()));
            } else {
                expenseCategorySums.put(cat, t.getAmount());
            }
        }

        BigDecimal finalTotalSpent = totalSpent.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : totalSpent;
        List<DashboardStatsResponse.GroupStats> categorySpentBreakdown = new ArrayList<>();
        expenseCategorySums.forEach((category, amount) -> {
            double percentage = amount.multiply(new BigDecimal("100"))
                    .divide(finalTotalSpent, 2, RoundingMode.HALF_UP)
                    .doubleValue();
            String icon = "💸";
            if ("Nguyên liệu".equalsIgnoreCase(category)) icon = "🥬";
            else if ("Đặt đồ ăn".equalsIgnoreCase(category)) icon = "🛵";
            else if ("Ăn ngoài".equalsIgnoreCase(category)) icon = "🍽️";
            else if ("Gia vị".equalsIgnoreCase(category)) icon = "🧂";

            categorySpentBreakdown.add(DashboardStatsResponse.GroupStats.builder()
                    .name(category)
                    .amount(amount)
                    .percentage(percentage)
                    .icon(icon)
                    .build());
        });

        // 7. Daily Spend History (Current Month up to today)
        Map<LocalDate, BigDecimal> dailySpentMap = monthTransactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getDate,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        List<DashboardStatsResponse.DaySpend> dailySpendHistory = new ArrayList<>();
        for (LocalDate d = startOfMonth; !d.isAfter(today); d = d.plusDays(1)) {
            BigDecimal amt = dailySpentMap.getOrDefault(d, BigDecimal.ZERO);
            dailySpendHistory.add(DashboardStatsResponse.DaySpend.builder()
                    .date(d)
                    .amount(amt)
                    .build());
        }

        // 8. Monthly Spend History (Past 6 months inclusive of current month)
        List<DashboardStatsResponse.MonthSpend> monthlySpendHistory = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MM/yyyy");
        for (int offset = 5; offset >= 0; offset--) {
            LocalDate mDate = today.minusMonths(offset);
            LocalDate startOfM = mDate.withDayOfMonth(1);
            LocalDate endOfM = mDate.withDayOfMonth(mDate.lengthOfMonth());
            String monthLabel = "Tháng " + mDate.getMonthValue();

            BigDecimal mAmount = allTransactions.stream()
                    .filter(t -> !t.getDate().isBefore(startOfM) && !t.getDate().isAfter(endOfM))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            monthlySpendHistory.add(DashboardStatsResponse.MonthSpend.builder()
                    .month(monthLabel)
                    .amount(mAmount)
                    .build());
        }

        return DashboardStatsResponse.builder()
                .totalIngredients(totalIngredients)
                .expiringIngredientsCount(expiringCount)
                .expiredIngredientsCount(expiredCount)
                .totalIngredientValue(totalIngredientValue)
                .budgetLimit(budgetLimit)
                .totalSpent(totalSpent)
                .remainingBudget(remainingBudget)
                .budgetStatus(budgetStatus)
                .wastedValueEstimation(wastedValueEstimation)
                .categorySpentBreakdown(categorySpentBreakdown)
                .storageLocationBreakdown(storageLocationBreakdown)
                .categoryIngredientBreakdown(categoryIngredientBreakdown)
                .dailySpendHistory(dailySpendHistory)
                .monthlySpendHistory(monthlySpendHistory)
                .build();
    }

    private String getIngredientCategoryIcon(String category) {
        if (category == null) return "📦";
        switch (category.toLowerCase()) {
            case "thịt": return "🥩";
            case "rau củ":
            case "rau": return "🥬";
            case "trái cây":
            case "hoa quả": return "🍎";
            case "hải sản":
            case "thủy hải sản": return "🐟";
            case "trứng":
            case "sữa": return "🥚";
            case "gia vị": return "🧂";
            default: return "📦";
        }
    }
}
