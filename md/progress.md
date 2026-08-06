# Progress Tracker - CookMate AI Backend

## Completed Modules
- **Module 1: Authentication & Security** (100%) - Auth logic, password encoders, JWT providers, CORS settings, and token blacklist caching.
- **Module 2: Inventory (Kho nguyên liệu)** (100%) - CRUD APIs for kitchen ingredients, automatic shelf-life expiration calculation, pagination, search, and sorting.
- **Module 3: Recipes (Món ăn gợi ý & AI Recommend)** (100%) - Dynamically matches recipes based on user inventory (prioritizing expiring items), integrates OpenAI API (gpt-4o-mini) for suggestions, and implements a smart local rule fallback.
- **Module 4: Budget & Expenses (Ngân sách & Chi tiêu)** (100%) - Supports logging food expenses with auto-inventory sync, tracking monthly budgets, and viewing dynamic category breakdowns and cheap meal suggestions.

---

## Module 2: Inventory Details

### 1. Entity Created
- [Ingredient](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/model/Ingredient.java): Persists items (id, name, quantity, unit, price, storageLocation, purchaseDate, expiryDate, icon, category, note) associated with a `User`.

### 2. DTOs & Mapper
- [IngredientRequest](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/IngredientRequest.java): Payload validation (NotBlank name, Positive quantity, Positive expiryDays).
- [IngredientResponse](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/IngredientResponse.java): Response payload, returns dynamically computed `daysLeft` (expiryDate - now).
- [IngredientMapper](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/mapper/IngredientMapper.java): Maps between entity and DTO fields.

### 3. Repository
- [IngredientRepository](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/repository/IngredientRepository.java): Custom JPQL query executing searches by name, filters by storage location and food category, with paging.

### 4. Service
- [IngredientService](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/IngredientService.java) & [IngredientServiceImpl](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/impl/IngredientServiceImpl.java): Performs operations and validates user ownership.

### 5. Controller
- [IngredientController](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/controller/IngredientController.java): Exposes REST endpoints at prefix `/api/v1/inventory`:
  - `POST /`: Add new ingredient to current user's inventory.
  - `GET /`: Retrieve paginated user inventory with filters (`search`, `category`, `storageLocation`).
  - `GET /{id}`: Single ingredient details.
  - `PUT /{id}`: Edit ingredient details.
  - `DELETE /{id}`: Delete ingredient.

### 6. Seeder
- [DataSeeder.java](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/seed/DataSeeder.java): Seeds the default user (`ban@cookmate.vn`) and initial ingredients (Trứng gà, Rau muống, Thịt heo, Cà chua, Cà rốt) matching the UI screens.

---

## Module 3: Recipes Details

### 1. DTOs
- [RecipeResponse](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/RecipeResponse.java): Unified recipe response structure matching the React Native frontend layout.

### 2. Services
- [OpenAiService](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/OpenAiService.java): Integrates with OpenAI's `gpt-4o-mini` utilizing native `HttpClient` with strict JSON mode formatting.
- [RecipeService](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/RecipeService.java) & [RecipeServiceImpl](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/impl/RecipeServiceImpl.java): Fetches user ingredients, prioritizes expiring items, queries OpenAI, and implements a smart local dynamic rule fallback.

### 3. Controller
- [RecipeController](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/controller/RecipeController.java): Exposes `/api/v1/recipes/recommend` protected endpoint.

### 4. Client Integration
- [recipe.service.ts](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/services/recipe.service.ts): Client-side API calls.
- [recipes.tsx](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/app/recipes.tsx): Fetches dynamic backend recipes with `RefreshControl` support.

---

## Module 4: Budget & Expenses Details

### 1. Entity Created
- [Transaction](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/model/Transaction.java): Persists expense log entries (id, name, amount, category, date, note, user).
- Modified [User](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/model/User.java) to track a monthly food budget limit field.

### 2. DTOs
- [TransactionRequest](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/TransactionRequest.java): Expense log input validations.
- [TransactionResponse](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/TransactionResponse.java): Expense listing with category-specific icon rendering.
- [BudgetSummaryResponse](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/BudgetSummaryResponse.java): Custom dashboard summary wrapping month details, spent amounts, category stats, and cheap meal suggestions.

### 3. Repository
- [TransactionRepository](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/repository/TransactionRepository.java): Standard JPA repository methods with date range querying.

### 4. Service & Controller
- [TransactionService](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/TransactionService.java) & [TransactionServiceImpl](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/impl/TransactionServiceImpl.java): Performs business calculations, handles inventory syncing, and resolves saving recipe suggestions.
- [TransactionController](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/controller/TransactionController.java): REST mappings at `/api/v1/transactions`.

### 5. Client Integration
- [transaction.service.ts](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/services/transaction.service.ts): Client-side API calls.
- [budget.tsx](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/app/budget.tsx): Rewired dashboard views and input sheets to consume backend transaction data.

## Module 5: Dashboard & Statistics Details

### 1. DTOs
- [DashboardStatsResponse](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/dto/DashboardStatsResponse.java): Response payload, returns comprehensive analytics for kitchen items, remaining budget, and custom spend trends.

### 2. Services
- [DashboardService](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/DashboardService.java) & [DashboardServiceImpl](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/service/impl/DashboardServiceImpl.java): Aggregates user's kitchen items and monthly transactions to calculate statistics, categorized expenses, and monthly spend charts.

### 3. Controller
- [DashboardController](file:///d:/code/ctdmst/product/CookMateAI_test/server/src/main/java/demo/server/controller/DashboardController.java): Exposes `/api/v1/dashboard/statistics` protected endpoint.

### 4. Client Integration
- [dashboard.service.ts](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/services/dashboard.service.ts): Client-side API calls.
- [statistics.tsx](file:///d:/code/ctdmst/product/CookMateAI_test/client/src/app/statistics.tsx): Custom reporting dashboard screen presenting analytics, horizontal category meters, and interactive vertical bar charts.

---

## Overall Backend Progress: 100%
- [x] **Module 1: Authentication & Security** (20%)
- [x] **Module 2: Inventory (Kho nguyên liệu)** (20%)
- [x] **Module 3: Recipes (Món ăn gợi ý & AI Recommend)** (20%)
- [x] **Module 4: Budget & Expenses (Ngân sách & Chi tiêu)** (20%)
- [x] **Module 5: Dashboard & Statistics (Thống kê)** (10%)
- [x] **Module 6: AI Chatbot (Hỗ trợ nấu ăn)** (10%)
