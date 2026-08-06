package demo.server.seed;

import demo.server.model.Ingredient;
import demo.server.model.Permission;
import demo.server.model.Role;
import demo.server.model.User;
import demo.server.model.Transaction;
import demo.server.repository.IngredientRepository;
import demo.server.repository.PermissionRepository;
import demo.server.repository.RoleRepository;
import demo.server.repository.TransactionRepository;
import demo.server.repository.UserRepository;
import lombok.AccessLevel;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DataSeeder implements CommandLineRunner {

    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    UserRepository userRepository;
    IngredientRepository ingredientRepository;
    TransactionRepository transactionRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("===> Khởi chạy DataSeeder để tạo dữ liệu mặc định...");

        // 1. Seed Permissions
        Permission readProfile = seedPermission("READ_PROFILE", "Xem thông tin cá nhân");
        Permission writeProfile = seedPermission("WRITE_PROFILE", "Cập nhật thông tin cá nhân");
        Permission manageInventory = seedPermission("MANAGE_INVENTORY", "Quản lý kho nguyên liệu");
        Permission manageBudget = seedPermission("MANAGE_BUDGET", "Quản lý ngân sách chi tiêu");

        Set<Permission> userPermissions = Set.of(readProfile, writeProfile, manageInventory, manageBudget);
        Set<Permission> adminPermissions = new HashSet<>(userPermissions);

        // 2. Seed Roles
        Role userRole = seedRole("ROLE_USER", "Vai trò người dùng thông thường", userPermissions);
        Role adminRole = seedRole("ROLE_ADMIN", "Vai trò quản trị viên hệ thống", adminPermissions);

        // 3. Seed Default Mock Users
        User mockUser = seedUser("ban@cookmate.vn", "Duy Anh", "password123", new BigDecimal("1500000"), Set.of(userRole));
        User user2 = seedUser("hoa@cookmate.vn", "Quỳnh Hoa", "password123", new BigDecimal("2000000"), Set.of(userRole));
        User user3 = seedUser("minh@cookmate.vn", "Hoàng Minh", "password123", new BigDecimal("1200000"), Set.of(userRole));

        // 4. Seed Ingredients for ban@cookmate.vn (User 1)
        seedIngredient("Trứng gà", 5.0, "quả", "🥚", "Trứng", "Ngăn mát", 6, mockUser);
        seedIngredient("Rau muống", 1.0, "bó", "🥬", "Rau củ", "Ngăn mát", 1, mockUser);
        seedIngredient("Thịt heo", 300.0, "g", "🥩", "Thịt", "Ngăn mát", 2, mockUser);
        seedIngredient("Cà chua", 3.0, "quả", "🍅", "Rau củ", "Ngăn mát", 4, mockUser);
        seedIngredient("Cà rốt", 2.0, "củ", "🥕", "Rau củ", "Ngăn mát", 2, mockUser);

        // 5. Seed Ingredients for hoa@cookmate.vn (User 2)
        seedIngredient("Thịt bò", 500.0, "g", "🥩", "Thịt", "Ngăn đá", 14, user2);
        seedIngredient("Bông cải xanh", 1.0, "cây", "🥦", "Rau củ", "Ngăn mát", 3, user2);
        seedIngredient("Sữa tươi", 1.0, "hộp", "🥛", "Khác", "Ngăn mát", 5, user2);
        seedIngredient("Hành tây", 2.0, "củ", "🧅", "Rau củ", "Bên ngoài", 10, user2);

        // 6. Seed Ingredients for minh@cookmate.vn (User 3)
        seedIngredient("Ức gà", 400.0, "g", "🍗", "Thịt", "Ngăn đá", 7, user3);
        seedIngredient("Bắp cải", 0.5, "cái", "🥬", "Rau củ", "Ngăn mát", 4, user3);
        seedIngredient("Gừng", 50.0, "g", "🧄", "Gia vị", "Bên ngoài", 15, user3);
        seedIngredient("Trứng vịt", 6.0, "quả", "🥚", "Trứng", "Ngăn mát", 8, user3);

        // 7. Seed Transactions for Quỳnh Hoa (User 2)
        seedTransaction("Mua thịt bò siêu thị", new BigDecimal("150000"), "Nguyên liệu", LocalDate.now(), "Mua tại WinMart", user2);
        seedTransaction("Đặt trà sữa Koi", new BigDecimal("65000"), "Đặt đồ ăn", LocalDate.now().minusDays(1), "Giao hàng qua ShopeeFood", user2);
        seedTransaction("Ăn lẩu Haidilao cuối tuần", new BigDecimal("350000"), "Ăn ngoài", LocalDate.now().minusDays(3), "Đi ăn cùng gia đình", user2);

        // 8. Seed Transactions for Hoàng Minh (User 3)
        seedTransaction("Mua ức gà và rau cải", new BigDecimal("75000"), "Nguyên liệu", LocalDate.now(), "Mua tại chợ dân sinh", user3);
        seedTransaction("Mua hành tỏi gừng gia vị", new BigDecimal("25000"), "Gia vị", LocalDate.now().minusDays(2), "Tiệm tạp hóa cô Ba", user3);

        log.info("===> Hoàn tất chạy DataSeeder!");
    }

    private Permission seedPermission(String name, String description) {
        return permissionRepository.findById(name)
                .orElseGet(() -> {
                    log.info("Seeding Permission: {}", name);
                    return permissionRepository.save(
                            Permission.builder()
                                    .name(name)
                                    .description(description)
                                    .build()
                    );
                });
    }

    private Role seedRole(String name, String description, Set<Permission> permissions) {
        return roleRepository.findById(name)
                .map(role -> {
                    role.setPermissions(permissions);
                    return roleRepository.save(role);
                })
                .orElseGet(() -> {
                    log.info("Seeding Role: {}", name);
                    return roleRepository.save(
                            Role.builder()
                                    .name(name)
                                    .description(description)
                                    .permissions(permissions)
                                    .build()
                    );
                });
    }

    private User seedUser(String email, String name, String rawPassword, BigDecimal monthlyBudget, Set<Role> roles) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setMonthlyBudget(monthlyBudget);
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    log.info("Seeding User: {}", email);
                    return userRepository.save(
                            User.builder()
                                    .email(email)
                                    .name(name)
                                    .password(passwordEncoder.encode(rawPassword))
                                    .emailVerified(true)
                                    .monthlyBudget(monthlyBudget)
                                    .roles(roles)
                                    .build()
                    );
                });
    }

    private void seedIngredient(
            String name,
            Double quantity,
            String unit,
            String icon,
            String category,
            String storageLocation,
            int expiryDays,
            User user
    ) {
        // Query if this user already has an ingredient with this exact name
        boolean exists = ingredientRepository.findByFilters(user, name, null, null, PageRequest.of(0, 1))
                .getTotalElements() > 0;
        
        if (!exists) {
            log.info("Seeding Ingredient: {}", name);
            ingredientRepository.save(
                    Ingredient.builder()
                            .name(name)
                            .quantity(quantity)
                            .unit(unit)
                            .icon(icon)
                            .category(category)
                            .storageLocation(storageLocation)
                            .purchaseDate(LocalDate.now())
                            .expiryDate(LocalDate.now().plusDays(expiryDays))
                            .user(user)
                            .build()
            );
        }
    }

    private void seedTransaction(
            String name,
            BigDecimal amount,
            String category,
            LocalDate date,
            String note,
            User user
    ) {
        boolean exists = transactionRepository.findByUserOrderByDateDesc(user).stream()
                .anyMatch(t -> t.getName().equalsIgnoreCase(name) && t.getAmount().compareTo(amount) == 0);
        if (!exists) {
            log.info("Seeding Transaction: {} for {}", name, user.getEmail());
            transactionRepository.save(
                    Transaction.builder()
                            .name(name)
                            .amount(amount)
                            .category(category)
                            .date(date)
                            .note(note)
                            .user(user)
                            .build()
            );
        }
    }
}
