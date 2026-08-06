package demo.server.service;

import demo.server.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshTokenRequest request);
    void logout(String token);
    void verifyEmail(VerifyEmailRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    demo.server.dto.UserResponse getProfile(demo.server.model.User user);
}
