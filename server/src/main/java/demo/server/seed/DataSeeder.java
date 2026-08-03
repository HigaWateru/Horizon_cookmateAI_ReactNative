package demo.server.seed;

import demo.server.model.Ingredient;
import demo.server.model.Permission;
import demo.server.model.Role;
import demo.server.model.User;
import demo.server.repository.IngredientRepository;
import demo.server.repository.PermissionRepository;
import demo.server.repository.RoleRepository;
import demo.server.repository.UserRepository;
import lombok.AccessLevel;
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

        // 3. Seed Default Mock User
        User mockUser = seedUser("ban@cookmate.vn", "Duy Anh", "password123", Set.of(userRole));

        // 4. Seed Default Mock Ingredients
        seedIngredient("Trứng gà", 5.0, "quả", "🥚", "Trứng", "Ngăn mát", 6, mockUser);
        seedIngredient("Rau muống", 1.0, "bó", "🥬", "Rau củ", "Ngăn mát", 1, mockUser);
        seedIngredient("Thịt heo", 300.0, "g", "🥩", "Thịt", "Ngăn mát", 2, mockUser);
        seedIngredient("Cà chua", 3.0, "quả", "🍅", "Rau củ", "Ngăn mát", 4, mockUser);
        seedIngredient("Cà rốt", 2.0, "củ", "🥕", "Rau củ", "Ngăn mát", 2, mockUser);

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

    private User seedUser(String email, String name, String rawPassword, Set<Role> roles) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Seeding User: {}", email);
                    return userRepository.save(
                            User.builder()
                                    .email(email)
                                    .name(name)
                                    .password(passwordEncoder.encode(rawPassword))
                                    .emailVerified(true)
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
}
