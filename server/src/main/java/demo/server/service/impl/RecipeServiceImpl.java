package demo.server.service.impl;

import demo.server.dto.RecipeResponse;
import demo.server.model.Ingredient;
import demo.server.model.User;
import demo.server.repository.IngredientRepository;
import demo.server.service.OpenAiService;
import demo.server.service.RecipeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RecipeServiceImpl implements RecipeService {

    IngredientRepository ingredientRepository;
    OpenAiService openAiService;

    static List<PredefinedRecipe> PREDEFINED_RECIPES = List.of(
            new PredefinedRecipe("Thịt xào rau muống", List.of("Rau muống", "Thịt heo"), "🥬", "20 phút"),
            new PredefinedRecipe("Rau muống xào tỏi", List.of("Rau muống"), "🧄", "12 phút"),
            new PredefinedRecipe("Canh rau thịt băm", List.of("Rau muống", "Thịt heo"), "🍲", "25 phút"),
            new PredefinedRecipe("Cơm rang thịt rau", List.of("Thịt heo", "Rau muống"), "🍚", "18 phút"),
            new PredefinedRecipe("Trứng chiên cà chua", List.of("Trứng gà", "Cà chua"), "🍳", "15 phút"),
            new PredefinedRecipe("Thịt heo xào cà rốt", List.of("Thịt heo", "Cà rốt"), "🥕", "18 phút"),
            new PredefinedRecipe("Canh trứng cà chua", List.of("Trứng gà", "Cà chua"), "🥣", "14 phút"),
            new PredefinedRecipe("Thịt heo kho trứng", List.of("Thịt heo", "Trứng gà"), "🍖", "35 phút")
    );

    @Override
    public List<RecipeResponse> getRecommendations(User currentUser) {
        List<Ingredient> ingredients = ingredientRepository.findByUser(currentUser);
        log.info("Fetching recipe recommendations for user: {} with {} ingredients.", currentUser.getEmail(), ingredients.size());

        if (ingredients.isEmpty()) {
            log.info("User inventory is empty. Returning default recipes.");
            return getFallbackRecommendations(currentUser, ingredients);
        }

        // Try AI recommendation first
        String prompt = buildPrompt(ingredients);
        List<RecipeResponse> aiRecipes = openAiService.getAiRecommendations(prompt);
        if (aiRecipes != null && !aiRecipes.isEmpty()) {
            log.info("AI Recommendations retrieved successfully from OpenAI.");
            return aiRecipes;
        }

        log.info("AI Recommendation failed or key not set. Using smart local recommendations fallback.");
        return getFallbackRecommendations(currentUser, ingredients);
    }

    private String buildPrompt(List<Ingredient> ingredients) {
        StringBuilder sb = new StringBuilder();
        sb.append("Danh sách các nguyên liệu hiện có trong tủ lạnh của người dùng:\n");
        LocalDate now = LocalDate.now();
        for (Ingredient ing : ingredients) {
            long daysLeft = ChronoUnit.DAYS.between(now, ing.getExpiryDate());
            sb.append("- ").append(ing.getName())
              .append(": ").append(ing.getQuantity()).append(" ").append(ing.getUnit())
              .append(" (Hạn còn: ").append(daysLeft).append(" ngày)\n");
        }
        sb.append("\nHãy gợi ý 3-5 món ăn ngon của Việt Nam dựa trên các nguyên liệu trên.");
        return sb.toString();
    }

    private List<RecipeResponse> getFallbackRecommendations(User currentUser, List<Ingredient> userIngredients) {
        List<RecipeResponse> results = new ArrayList<>();
        LocalDate now = LocalDate.now();

        // Map user ingredients by lowercased name for fast lookup
        Map<String, Ingredient> ingredientMap = new HashMap<>();
        for (Ingredient ing : userIngredients) {
            ingredientMap.put(ing.getName().toLowerCase(), ing);
        }

        for (PredefinedRecipe recipe : PREDEFINED_RECIPES) {
            List<String> matchedNames = new ArrayList<>();
            List<String> missingNames = new ArrayList<>();
            Ingredient urgentIngredient = null;
            long minDaysLeft = Long.MAX_VALUE;

            for (String req : recipe.requiredIngredients) {
                // Smart partial name matching
                boolean found = false;
                String matchedKey = null;
                for (String userIngName : ingredientMap.keySet()) {
                    if (userIngName.contains(req.toLowerCase()) || req.toLowerCase().contains(userIngName)) {
                        found = true;
                        matchedKey = userIngName;
                        break;
                    }
                }

                if (found) {
                    matchedNames.add(req);
                    Ingredient ing = ingredientMap.get(matchedKey);
                    long daysLeft = ChronoUnit.DAYS.between(now, ing.getExpiryDate());
                    if (daysLeft < minDaysLeft) {
                        minDaysLeft = daysLeft;
                        urgentIngredient = ing;
                    }
                } else {
                    missingNames.add(req);
                }
            }

            int matchPercent = (matchedNames.size() * 100) / recipe.requiredIngredients.size();
            
            // Build response fields
            String buyMore = "Không";
            String extraCost = "0đ";
            String costLabel = "0đ mua thêm";
            
            if (!missingNames.isEmpty()) {
                buyMore = String.join(", ", missingNames);
                // Estimate cost: flat 10.000đ per missing ingredient
                long cost = missingNames.size() * 10000L;
                extraCost = String.format("%,dđ", cost);
                costLabel = "Cần mua thêm " + buyMore;
            }

            String reason = "Món ăn ngon, dễ chế biến";
            if (urgentIngredient != null && minDaysLeft <= 2) {
                reason = "Tận dụng " + urgentIngredient.getName() + " sắp hết hạn";
            } else if (urgentIngredient != null) {
                reason = "Dùng tốt " + urgentIngredient.getName() + " đang có sẵn";
            }

            results.add(RecipeResponse.builder()
                    .id(UUID.nameUUIDFromBytes((recipe.name + "_" + currentUser.getId()).getBytes()).toString())
                    .name(recipe.name)
                    .match(matchPercent)
                    .time(recipe.time)
                    .costLabel(costLabel)
                    .extraCost(extraCost)
                    .buyMore(buyMore)
                    .reason(reason)
                    .ingredients(matchedNames)
                    .icon(recipe.icon)
                    .build());
        }

        // Sort by match percentage descending, then by name
        results.sort((a, b) -> {
            if (b.getMatch() != a.getMatch()) {
                return Integer.compare(b.getMatch(), a.getMatch());
            }
            return a.getName().compareTo(b.getName());
        });

        return results;
    }

    private static class PredefinedRecipe {
        String name;
        List<String> requiredIngredients;
        String icon;
        String time;

        public PredefinedRecipe(String name, List<String> requiredIngredients, String icon, String time) {
            this.name = name;
            this.requiredIngredients = requiredIngredients;
            this.icon = icon;
            this.time = time;
        }
    }
}
