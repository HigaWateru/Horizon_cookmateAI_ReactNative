package demo.server.controller;

import demo.server.common.ApiResponse;
import demo.server.dto.BudgetSummaryResponse;
import demo.server.dto.TransactionRequest;
import demo.server.dto.TransactionResponse;
import demo.server.security.CustomUserDetails;
import demo.server.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Transaction API", description = "Các endpoint ghi chép chi tiêu và quản lý ngân sách ăn uống")
public class TransactionController {

    TransactionService transactionService;

    @PostMapping
    @Operation(summary = "Ghi chép một khoản chi tiêu mới (có tích hợp thêm vào kho nếu thuộc nhóm Nguyên liệu)")
    public ApiResponse<TransactionResponse> create(
            @RequestBody @Valid TransactionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                "Ghi chép chi tiêu thành công",
                transactionService.create(request, userDetails.getUser())
        );
    }

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách các khoản chi tiêu đã ghi chép")
    public ApiResponse<List<TransactionResponse>> getAll(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                transactionService.getAll(userDetails.getUser())
        );
    }

    @GetMapping("/summary")
    @Operation(summary = "Lấy báo cáo tổng quan ngân sách tháng, gợi ý chi tiêu hàng ngày và các món gợi ý tiết kiệm")
    public ApiResponse<BudgetSummaryResponse> getSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                transactionService.getSummary(userDetails.getUser())
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin chi tiết một khoản chi tiêu")
    public ApiResponse<TransactionResponse> update(
            @PathVariable String id,
            @RequestBody @Valid TransactionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                "Cập nhật khoản chi tiêu thành công",
                transactionService.update(id, request, userDetails.getUser())
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa hoàn toàn lịch sử ghi chép một khoản chi tiêu")
    public ApiResponse<String> delete(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        transactionService.delete(id, userDetails.getUser());
        return ApiResponse.success("Xóa khoản chi tiêu thành công", id);
    }
}
