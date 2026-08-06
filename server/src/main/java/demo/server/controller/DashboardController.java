package demo.server.controller;

import demo.server.common.ApiResponse;
import demo.server.dto.DashboardStatsResponse;
import demo.server.security.CustomUserDetails;
import demo.server.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Dashboard & Statistics API", description = "Các endpoint báo cáo và thống kê thông minh")
public class DashboardController {

    DashboardService dashboardService;

    @GetMapping("/statistics")
    @Operation(summary = "Lấy báo cáo và số liệu thống kê tổng quan về kho nguyên liệu và chi tiêu")
    public ApiResponse<DashboardStatsResponse> getStatistics(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(
                dashboardService.getStatistics(userDetails.getUser())
        );
    }
}
