package demo.server.service.impl;

import demo.server.dto.BudgetSummaryResponse;
import demo.server.dto.IngredientRequest;
import demo.server.dto.RecipeResponse;
import demo.server.dto.TransactionRequest;
import demo.server.dto.TransactionResponse;
import demo.server.exception.AppException;
import demo.server.exception.ErrorCode;
import demo.server.model.Transaction;
import demo.server.model.User;
import demo.server.repository.TransactionRepository;
import demo.server.service.IngredientService;
import demo.server.service.RecipeService;
import demo.server.service.TransactionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    TransactionRepository transactionRepository;
    IngredientService ingredientService;
    RecipeService recipeService;

    @Override
    @Transactional
    public TransactionResponse create(TransactionRequest request, User currentUser) {
        LocalDate transactionDate = request.getDate() != null ? request.getDate() : LocalDate.now();

        Transaction transaction = Transaction.builder()
                .name(request.getName().trim())
                .amount(request.getAmount())
                .category(request.getCategory().trim())
                .date(transactionDate)
                .note(request.getNote() != null ? request.getNote().trim() : null)
                .user(currentUser)
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Auto inventory sync if checked and category is Nguyên liệu
        if (Boolean.TRUE.equals(request.getAddToInventory()) && "Nguyên liệu".equalsIgnoreCase(request.getCategory())) {
            log.info("Auto syncing transaction '{}' to inventory for user: {}", request.getName(), currentUser.getEmail());
            try {
                IngredientRequest ingredientRequest = IngredientRequest.builder()
                        .name(request.getName().trim())
                        .quantity(1.0) // default amount
                        .unit("gói")    // default unit
                        .price(request.getAmount())
                        .storageLocation("Ngăn mát") // default storage
                        .icon("🥬") // default icon representation
                        .category("Khác")
                        .expiryDays(3) // default shelf-life
                        .note("Tự động tạo từ chi tiêu: " + request.getName().trim())
                        .build();

                ingredientService.create(ingredientRequest, currentUser);
            } catch (Exception e) {
                log.error("Failed to auto-sync ingredient to inventory: {}", e.getMessage(), e);
            }
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse update(String id, TransactionRequest request, User currentUser) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (!transaction.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        transaction.setName(request.getName().trim());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory().trim());
        if (request.getDate() != null) {
            transaction.setDate(request.getDate());
        }
        transaction.setNote(request.getNote() != null ? request.getNote().trim() : null);

        Transaction updated = transactionRepository.save(transaction);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(String id, User currentUser) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (!transaction.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        transactionRepository.delete(transaction);
    }

    @Override
    public List<TransactionResponse> getAll(User currentUser) {
        return transactionRepository.findByUserOrderByDateDesc(currentUser).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetSummaryResponse getSummary(User currentUser) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        // 1. Fetch current month's transactions
        List<Transaction> monthTransactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(
                currentUser, startOfMonth, endOfMonth
        );

        // 2. Compute spent amounts
        BigDecimal totalSpent = monthTransactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Compute remaining days in the month
        long daysLeft = ChronoUnit.DAYS.between(today, endOfMonth) + 1; // inclusive

        // 4. Sum category totals
        Map<String, BigDecimal> categorySums = new LinkedHashMap<>();
        categorySums.put("Nguyên liệu", BigDecimal.ZERO);
        categorySums.put("Đặt đồ ăn", BigDecimal.ZERO);
        categorySums.put("Ăn ngoài", BigDecimal.ZERO);
        categorySums.put("Gia vị", BigDecimal.ZERO);

        for (Transaction t : monthTransactions) {
            String cat = t.getCategory();
            if (categorySums.containsKey(cat)) {
                categorySums.put(cat, categorySums.get(cat).add(t.getAmount()));
            }
        }

        List<BudgetSummaryResponse.BudgetCategory> categories = List.of(
                BudgetSummaryResponse.BudgetCategory.builder().id("ingredients").name("Nguyên liệu").amount(categorySums.get("Nguyên liệu")).icon("▣").build(),
                BudgetSummaryResponse.BudgetCategory.builder().id("delivery").name("Đặt đồ ăn").amount(categorySums.get("Đặt đồ ăn")).icon("▤").build(),
                BudgetSummaryResponse.BudgetCategory.builder().id("eating-out").name("Ăn ngoài").amount(categorySums.get("Ăn ngoài")).icon("○").build(),
                BudgetSummaryResponse.BudgetCategory.builder().id("spices").name("Gia vị").amount(categorySums.get("Gia vị")).icon("✦").build()
        );

        // 5. Query cheap recipe suggestions using Module 3 service
        List<BudgetSummaryResponse.BudgetSuggestion> suggestions = new ArrayList<>();
        try {
            List<RecipeResponse> recipes = recipeService.getRecommendations(currentUser);
            if (recipes != null && !recipes.isEmpty()) {
                suggestions = recipes.stream()
                        .sorted(Comparator.comparingLong(r -> parseExtraCost(r.getExtraCost())))
                        .limit(2)
                        .map(r -> BudgetSummaryResponse.BudgetSuggestion.builder()
                                .id("suggest-" + r.getId())
                                .name(r.getName())
                                .costLabel(r.getCostLabel())
                                .build())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Failed to query recipe suggestions for budget dashboard: {}", e.getMessage());
        }

        // Predefined fallback suggestions if no recipes are available
        if (suggestions.isEmpty()) {
            suggestions = List.of(
                    BudgetSummaryResponse.BudgetSuggestion.builder().id("suggest-thit-xao-rau-muong").name("Thịt xào rau muống").costLabel("0đ mua thêm").build(),
                    BudgetSummaryResponse.BudgetSuggestion.builder().id("suggest-trung-ca-chua").name("Trứng cà chua").costLabel("10.000đ mua thêm").build()
            );
        }

        // 6. Map recent expenses (up to 10 entries)
        List<TransactionResponse> recentExpenses = monthTransactions.stream()
                .limit(10)
                .map(this::toResponse)
                .collect(Collectors.toList());

        String monthLabel = "Tháng " + today.getMonthValue() + "/" + today.getYear();

        BigDecimal budgetLimit = currentUser.getMonthlyBudget() != null ? currentUser.getMonthlyBudget() : new BigDecimal("1500000");

        return BudgetSummaryResponse.builder()
                .monthLabel(monthLabel)
                .budgetLimit(budgetLimit)
                .spent(totalSpent)
                .daysLeft(daysLeft)
                .suggestions(suggestions)
                .categories(categories)
                .expenses(recentExpenses)
                .build();
    }

    private long parseExtraCost(String extraCostStr) {
        if (extraCostStr == null || extraCostStr.isEmpty() || extraCostStr.equalsIgnoreCase("0đ")) {
            return 0L;
        }
        try {
            String normalized = extraCostStr.replace(".", "").replace("đ", "").trim();
            return Long.parseLong(normalized);
        } catch (Exception e) {
            return 999999L;
        }
    }

    private TransactionResponse toResponse(Transaction transaction) {
        String icon = "💸";
        if (transaction.getCategory() != null) {
            switch (transaction.getCategory()) {
                case "Nguyên liệu": icon = "▣"; break;
                case "Đặt đồ ăn": icon = "▤"; break;
                case "Ăn ngoài": icon = "○"; break;
                case "Gia vị": icon = "✦"; break;
            }
        }
        return TransactionResponse.builder()
                .id(transaction.getId())
                .name(transaction.getName())
                .amount(transaction.getAmount())
                .category(transaction.getCategory())
                .date(transaction.getDate())
                .note(transaction.getNote())
                .icon(icon)
                .build();
    }
}
