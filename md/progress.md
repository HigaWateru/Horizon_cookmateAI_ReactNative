# Progress Tracker - CookMate AI Backend

## Completed Modules
- **Module 1: Authentication & Security** (100%) - Auth logic, password encoders, JWT providers, CORS settings, and token blacklist caching.
- **Module 2: Inventory (Kho nguyên liệu)** (100%) - CRUD APIs for kitchen ingredients, automatic shelf-life expiration calculation, pagination, search, and sorting.

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

## Overall Backend Progress: 40%
- [x] **Module 1: Authentication & Security** (20%)
- [x] **Module 2: Inventory (Kho nguyên liệu)** (20%)
- [ ] **Module 3: Recipes (Món ăn gợi ý & AI Recommend)** (0%)
- [ ] **Module 4: Budget & Expenses (Ngân sách & Chi tiêu)** (0%)
- [ ] **Module 5: Dashboard & Statistics (Thống kê)** (0%)
- [ ] **Module 6: AI Chatbot (Hỗ trợ nấu ăn)** (0%)
