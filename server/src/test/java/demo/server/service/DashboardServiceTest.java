package demo.server.service;

import demo.server.dto.DashboardStatsResponse;
import demo.server.model.Ingredient;
import demo.server.model.Transaction;
import demo.server.model.User;
import demo.server.repository.IngredientRepository;
import demo.server.repository.TransactionRepository;
import demo.server.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    IngredientRepository ingredientRepository;

    @Mock
    TransactionRepository transactionRepository;

    @InjectMocks
    DashboardServiceImpl dashboardService;

    User user;
    Ingredient ingredient1;
    Ingredient ingredient2;
    Transaction transaction1;
    Transaction transaction2;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("user-123")
                .email("test@cookmate.vn")
                .monthlyBudget(new BigDecimal("1000000"))
                .build();

        ingredient1 = Ingredient.builder()
                .id("ing-1")
                .name("Rau muống")
                .quantity(1.0)
                .unit("bó")
                .price(new BigDecimal("15000"))
                .storageLocation("Ngăn mát")
                .expiryDate(LocalDate.now().plusDays(2))
                .category("Rau củ")
                .user(user)
                .build();

        ingredient2 = Ingredient.builder()
                .id("ing-2")
                .name("Thịt heo")
                .quantity(500.0)
                .unit("g")
                .price(new BigDecimal("80000"))
                .storageLocation("Ngăn đá")
                .expiryDate(LocalDate.now().minusDays(1)) // Expired
                .category("Thịt")
                .user(user)
                .build();

        transaction1 = Transaction.builder()
                .id("tx-1")
                .name("Mua rau")
                .amount(new BigDecimal("15000"))
                .category("Nguyên liệu")
                .date(LocalDate.now())
                .user(user)
                .build();

        transaction2 = Transaction.builder()
                .id("tx-2")
                .name("Ăn phở")
                .amount(new BigDecimal("50000"))
                .category("Ăn ngoài")
                .date(LocalDate.now())
                .user(user)
                .build();
    }

    @Test
    void getStatistics_success() {
        when(ingredientRepository.findByUser(user)).thenReturn(Arrays.asList(ingredient1, ingredient2));
        when(transactionRepository.findByUserOrderByDateDesc(user)).thenReturn(Arrays.asList(transaction1, transaction2));

        DashboardStatsResponse response = dashboardService.getStatistics(user);

        assertNotNull(response);
        assertEquals(2, response.getTotalIngredients());
        assertEquals(1, response.getExpiringIngredientsCount()); // ingredient1 is plus 2 days
        assertEquals(1, response.getExpiredIngredientsCount()); // ingredient2 is minus 1 day
        assertEquals(0, response.getTotalIngredientValue().compareTo(new BigDecimal("95000")));
        assertEquals(0, response.getWastedValueEstimation().compareTo(new BigDecimal("95000"))); // Both are expiring/expired
        assertEquals(0, response.getBudgetLimit().compareTo(new BigDecimal("1000000")));
        assertEquals(0, response.getTotalSpent().compareTo(new BigDecimal("65000")));
        assertEquals(0, response.getRemainingBudget().compareTo(new BigDecimal("935000")));
        assertEquals("NORMAL", response.getBudgetStatus());

        // Location check
        assertEquals(2, response.getStorageLocationBreakdown().size());
        
        // Category check
        assertEquals(2, response.getCategoryIngredientBreakdown().size());

        verify(ingredientRepository, times(1)).findByUser(user);
        verify(transactionRepository, times(1)).findByUserOrderByDateDesc(user);
    }
}
