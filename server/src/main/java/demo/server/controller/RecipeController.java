package demo.server.controller;

import demo.server.common.ApiResponse;
import demo.server.dto.RecipeResponse;
import demo.server.security.CustomUserDetails;
import demo.server.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Recipe API", description = "Các endpoint đề xuất món ăn và gợi ý AI cho người dùng")
public class RecipeController {

    RecipeService recipeService;

    @GetMapping("/recommend")
    @Operation(summary = "Lấy danh sách món ăn đề xuất dựa trên nguyên liệu hiện có trong kho (AI & Local Fallback)")
    public ApiResponse<List<RecipeResponse>> getRecommendations(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                recipeService.getRecommendations(userDetails.getUser())
        );
    }
}
