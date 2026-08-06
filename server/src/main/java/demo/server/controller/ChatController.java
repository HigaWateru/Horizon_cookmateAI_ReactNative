package demo.server.controller;

import demo.server.common.ApiResponse;
import demo.server.dto.ChatRequest;
import demo.server.dto.ChatResponse;
import demo.server.security.CustomUserDetails;
import demo.server.service.OpenAiService;
import demo.server.repository.IngredientRepository;
import demo.server.model.Ingredient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "AI Chatbot API", description = "Các endpoint trợ lý ảo tư vấn nấu ăn và nguyên liệu")
public class ChatController {

    OpenAiService openAiService;
    IngredientRepository ingredientRepository;

    @PostMapping
    @Operation(summary = "Gửi tin nhắn chat và nhận phản hồi từ trợ lý CookMate AI")
    public ApiResponse<ChatResponse> chat(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Ingredient> ingredients = ingredientRepository.findByUser(userDetails.getUser());
        String reply = openAiService.getChatResponse(request.getMessage(), request.getHistory(), ingredients);
        return ApiResponse.success(new ChatResponse(reply));
    }
}
