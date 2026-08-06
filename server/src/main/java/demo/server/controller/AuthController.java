package demo.server.controller;

import demo.server.common.ApiResponse;
import demo.server.dto.*;
import demo.server.service.AuthService;
import demo.server.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import demo.server.exception.AppException;
import demo.server.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Authentication API", description = "Các endpoint phục vụ đăng ký, đăng nhập, đăng xuất và khôi phục mật khẩu")
public class AuthController {

    AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản người dùng mới")
    public ApiResponse<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        return ApiResponse.success("Đăng ký tài khoản thành công. Vui lòng kiểm tra mã xác thực gửi về email.", authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập bằng tài khoản và mật khẩu")
    public ApiResponse<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.success("Đăng nhập thành công", authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại")
    public ApiResponse<UserResponse> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return ApiResponse.success("Lấy thông tin tài khoản thành công", authService.getProfile(userDetails.getUser()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới mã access token sử dụng refresh token")
    public ApiResponse<AuthResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        return ApiResponse.success("Làm mới token thành công", authService.refresh(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất và đưa mã access token hiện tại vào danh sách đen")
    public ApiResponse<String> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && !authHeader.isEmpty()) {
            authService.logout(authHeader);
        }
        return ApiResponse.success("Đăng xuất thành công", "Mã token đã được đưa vào danh sách đen");
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Xác thực tài khoản email bằng OTP")
    public ApiResponse<String> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ApiResponse.success("Xác thực email thành công", "Tài khoản của bạn đã được xác thực");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Yêu cầu khôi phục mật khẩu (Gửi mã OTP về email)")
    public ApiResponse<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("Đã gửi mã khôi phục mật khẩu thành công", "Vui lòng kiểm tra hộp thư để lấy mã OTP");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Thay đổi mật khẩu mới thông qua mã OTP")
    public ApiResponse<String> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Đặt lại mật khẩu thành công", "Mật khẩu của bạn đã được cập nhật mới");
    }
}
