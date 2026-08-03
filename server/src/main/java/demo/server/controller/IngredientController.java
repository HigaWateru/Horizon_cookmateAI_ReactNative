package demo.server.controller;

import demo.server.common.ApiResponse;
import demo.server.common.PageResponse;
import demo.server.dto.IngredientRequest;
import demo.server.dto.IngredientResponse;
import demo.server.security.CustomUserDetails;
import demo.server.service.IngredientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Inventory API", description = "Các endpoint quản lý kho nguyên liệu của người dùng")
public class IngredientController {

    IngredientService ingredientService;

    @PostMapping
    @Operation(summary = "Thêm nguyên liệu mới vào kho")
    public ApiResponse<IngredientResponse> create(
            @RequestBody @Valid IngredientRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                "Thêm nguyên liệu vào kho thành công",
                ingredientService.create(request, userDetails.getUser())
        );
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách nguyên liệu trong kho với bộ lọc và phân trang")
    public ApiResponse<PageResponse<IngredientResponse>> getAll(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String storageLocation,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expiryDate") String sortBy,
            @RequestParam(defaultValue = "asc") String order
    ) {
        return ApiResponse.success(
                ingredientService.getAll(userDetails.getUser(), search, category, storageLocation, page, size, sortBy, order)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết một nguyên liệu")
    public ApiResponse<IngredientResponse> getById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                ingredientService.getById(id, userDetails.getUser())
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin một nguyên liệu")
    public ApiResponse<IngredientResponse> update(
            @PathVariable String id,
            @RequestBody @Valid IngredientRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                "Cập nhật nguyên liệu thành công",
                ingredientService.update(id, request, userDetails.getUser())
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa một nguyên liệu khỏi kho")
    public ApiResponse<String> delete(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ingredientService.delete(id, userDetails.getUser());
        return ApiResponse.success("Xóa nguyên liệu khỏi kho thành công", id);
    }
}
