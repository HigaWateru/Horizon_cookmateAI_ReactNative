package demo.server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import demo.server.dto.RecipeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class OpenAiService {

    @Value("${openai.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public List<RecipeResponse> getAiRecommendations(String ingredientsPrompt) {
        // Clean key format or check fallback
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${") || apiKey.contains("YOUR_API_KEY")) {
            log.warn("OpenAI API Key is not properly configured. Fallback to local recommendations.");
            return null;
        }

        try {
            // Construct the request body using Map to ensure proper JSON formatting
            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "Bạn là một đầu bếp chuyên nghiệp. Hãy gợi ý công thức món ăn Việt Nam dựa trên nguyên liệu được cung cấp. Trả về DUY NHẤT một đối tượng JSON chứa mảng \"recipes\" với cấu trúc:\n" +
                            "{\n" +
                            "  \"recipes\": [\n" +
                            "    {\n" +
                            "      \"name\": \"Tên món ăn\",\n" +
                            "      \"time\": \"Thời gian nấu (ví dụ: '20 phút')\",\n" +
                            "      \"match\": 92,\n" +
                            "      \"costLabel\": \"Nhãn chi phí mua thêm (ví dụ: '0đ mua thêm', 'Cần mua thêm tỏi')\",\n" +
                            "      \"extraCost\": \"Chi phí mua thêm (ví dụ: '0đ', '5.000đ')\",\n" +
                            "      \"buyMore\": \"Nguyên liệu cần mua thêm (ví dụ: 'Không', 'Tỏi')\",\n" +
                            "      \"reason\": \"Lý do gợi ý (ví dụ: 'Sử dụng rau sắp hết hạn')\",\n" +
                            "      \"ingredients\": [\"Nguyên liệu 1 trong tủ lạnh sử dụng\", \"Nguyên liệu 2 trong tủ lạnh sử dụng\"],\n" +
                            "      \"icon\": \"Emoji đại diện cho món ăn (ví dụ: '🥬', '🍳')\"\n" +
                            "    }\n" +
                            "  ]\n" +
                            "}"
            );

            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", ingredientsPrompt
            );

            Map<String, Object> requestBodyMap = Map.of(
                    "model", "gpt-4o-mini",
                    "messages", List.of(systemMessage, userMessage),
                    "response_format", Map.of("type", "json_object"),
                    "temperature", 0.7
            );

            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            log.info("Sending request to OpenAI API using model gpt-4o-mini...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("OpenAI API returned error status: {}. Body: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            String responseText = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            JsonNode responseJson = objectMapper.readTree(responseText);
            JsonNode recipesNode = responseJson.path("recipes");
            
            List<RecipeResponse> recipes = new ArrayList<>();
            if (recipesNode.isArray()) {
                for (JsonNode node : recipesNode) {
                    List<String> recipeIngredients = new ArrayList<>();
                    JsonNode ingNode = node.path("ingredients");
                    if (ingNode.isArray()) {
                        for (JsonNode ing : ingNode) {
                            recipeIngredients.add(ing.asText());
                        }
                    }
                    
                    recipes.add(RecipeResponse.builder()
                            .id(UUID.randomUUID().toString())
                            .name(node.path("name").asText("Món ăn gợi ý"))
                            .match(node.path("match").asInt(80))
                            .time(node.path("time").asText("20 phút"))
                            .costLabel(node.path("costLabel").asText("0đ mua thêm"))
                            .extraCost(node.path("extraCost").asText("0đ"))
                            .buyMore(node.path("buyMore").asText("Không"))
                            .reason(node.path("reason").asText("Gợi ý từ AI"))
                            .ingredients(recipeIngredients)
                            .icon(node.path("icon").asText("🍳"))
                            .build());
                }
            }
            return recipes;
        } catch (Exception e) {
            log.error("Error communicating with OpenAI or parsing response: {}", e.getMessage(), e);
            return null;
        }
    }
}
