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
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import demo.server.dto.ChatMessageDto;
import demo.server.model.Ingredient;

@Service
@Slf4j
public class OpenAiService {

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

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

    public String getChatResponse(String userMessage, List<ChatMessageDto> history, List<Ingredient> ingredients) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.startsWith("${") || apiKey.contains("YOUR_API_KEY")) {
            log.warn("OpenAI API Key is not properly configured. Falling back to Gemini...");
            return getGeminiChatResponse(userMessage, history, ingredients);
        }

        try {
            // Build the system prompt with user's inventory ingredients as context
            StringBuilder systemPromptBuilder = new StringBuilder();
            systemPromptBuilder.append("Bạn là trợ lý nấu ăn thông minh, thân thiện và nhiệt tình của ứng dụng CookMate AI.\n")
                    .append("Nhiệm vụ của bạn là tư vấn công thức món ăn, cách chế biến, bảo quản thực phẩm, cách lên thực đơn tiết kiệm chi phí.\n\n");

            if (ingredients != null && !ingredients.isEmpty()) {
                systemPromptBuilder.append("Dưới đây là danh sách nguyên liệu hiện có trong tủ lạnh của người dùng để bạn tham khảo khi tư vấn món ăn:\n");
                LocalDate now = LocalDate.now();
                for (Ingredient ing : ingredients) {
                    long daysLeft = ChronoUnit.DAYS.between(now, ing.getExpiryDate());
                    systemPromptBuilder.append("- ").append(ing.getName())
                            .append(": ").append(ing.getQuantity()).append(" ").append(ing.getUnit())
                            .append(" (Hạn còn: ").append(daysLeft).append(" ngày)\n");
                }
                systemPromptBuilder.append("\nƯu tiên gợi ý các món ăn tận dụng nguyên liệu sẵn có, đặc biệt là những đồ sắp hết hạn.\n\n");
            } else {
                systemPromptBuilder.append("Hiện tại tủ lạnh của người dùng đang trống. Hãy khuyến khích họ thêm nguyên liệu vào kho để nhận được gợi ý chính xác nhất, hoặc tư vấn các món ăn thông dụng.\n\n");
            }

            systemPromptBuilder.append("Hãy trả lời người dùng bằng tiếng Việt, ngắn gọn, dễ hiểu và trình bày đẹp mắt bằng markdown (nếu cần).");

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of(
                    "role", "system",
                    "content", systemPromptBuilder.toString()
            ));

            // Map and add history
            if (history != null) {
                for (ChatMessageDto msg : history) {
                    String role = "user".equalsIgnoreCase(msg.getSender()) ? "user" : "assistant";
                    messages.add(Map.of(
                            "role", role,
                            "content", msg.getText()
                    ));
                }
            }

            // Add the current user message
            messages.add(Map.of(
                    "role", "user",
                    "content", userMessage
            ));

            Map<String, Object> requestBodyMap = Map.of(
                    "model", "gpt-4o-mini",
                    "messages", messages,
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

            log.info("Sending chat completion request to OpenAI API...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("OpenAI Chat API returned error status: {}. Body: {}. Falling back to Gemini...", response.statusCode(), response.body());
                return getGeminiChatResponse(userMessage, history, ingredients);
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            return rootNode.path("choices").get(0).path("message").path("content").asText("Tôi chưa hiểu ý bạn, vui lòng nhập lại.");

        } catch (Exception e) {
            log.error("Error communicating with OpenAI Chat API: {}. Falling back to Gemini...", e.getMessage(), e);
            return getGeminiChatResponse(userMessage, history, ingredients);
        }
    }

    private String getGeminiChatResponse(String userMessage, List<ChatMessageDto> history, List<Ingredient> ingredients) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("${")) {
            log.warn("Gemini API Key is not configured. Cannot perform fallback.");
            return "Trợ lý CookMate AI hiện đang ngoại tuyến do cả OpenAI và Gemini chưa được cấu hình khóa chính xác.";
        }

        try {
            // Build system prompt
            StringBuilder systemPromptBuilder = new StringBuilder();
            systemPromptBuilder.append("Bạn là trợ lý nấu ăn thông minh, thân thiện và nhiệt tình của ứng dụng CookMate AI.\n")
                    .append("Nhiệm vụ của bạn là tư vấn công thức món ăn, cách chế biến, bảo quản thực phẩm, cách lên thực đơn tiết kiệm chi phí.\n\n");

            if (ingredients != null && !ingredients.isEmpty()) {
                systemPromptBuilder.append("Dưới đây là danh sách nguyên liệu hiện có trong tủ lạnh của người dùng để bạn tham khảo khi tư vấn món ăn:\n");
                LocalDate now = LocalDate.now();
                for (Ingredient ing : ingredients) {
                    long daysLeft = ChronoUnit.DAYS.between(now, ing.getExpiryDate());
                    systemPromptBuilder.append("- ").append(ing.getName())
                            .append(": ").append(ing.getQuantity()).append(" ").append(ing.getUnit())
                            .append(" (Hạn còn: ").append(daysLeft).append(" ngày)\n");
                }
                systemPromptBuilder.append("\nƯu tiên gợi ý các món ăn tận dụng nguyên liệu sẵn có, đặc biệt là những đồ sắp hết hạn.\n\n");
            } else {
                systemPromptBuilder.append("Hiện tại tủ lạnh của người dùng đang trống. Hãy khuyến khích họ thêm nguyên liệu vào kho để nhận được gợi ý chính xác nhất, hoặc tư vấn các món ăn thông dụng.\n\n");
            }

            systemPromptBuilder.append("Hãy trả lời người dùng bằng tiếng Việt, ngắn gọn, dễ hiểu và trình bày đẹp mắt bằng markdown (nếu cần).");

            // Build contents array for Gemini
            List<Map<String, Object>> contents = new ArrayList<>();
            if (history != null) {
                for (ChatMessageDto msg : history) {
                    String role = "user".equalsIgnoreCase(msg.getSender()) ? "user" : "model";
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", msg.getText()))
                    ));
                }
            }
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", userMessage))
            ));

            Map<String, Object> requestBodyMap = Map.of(
                    "contents", contents,
                    "systemInstruction", Map.of(
                            "parts", List.of(Map.of("text", systemPromptBuilder.toString()))
                    )
            );

            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey.trim();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            log.info("Sending chat completion request to Gemini API (OpenAI Fallback)...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API returned error status: {}. Body: {}", response.statusCode(), response.body());
                return "Rất tiếc, cả trợ lý OpenAI và Gemini đều đang gặp sự cố kết nối. Vui lòng thử lại sau!";
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            return rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText("Tôi chưa hiểu ý bạn, vui lòng nhập lại.");

        } catch (Exception e) {
            log.error("Error communicating with Gemini API: {}", e.getMessage(), e);
            return "Đã xảy ra lỗi trong quá trình trao đổi với trợ lý AI (Gemini Fallback). Vui lòng kiểm tra lại kết nối mạng!";
        }
    }
}
