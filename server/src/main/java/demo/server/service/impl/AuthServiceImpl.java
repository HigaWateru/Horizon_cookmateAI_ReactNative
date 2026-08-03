package demo.server.service.impl;

import demo.server.dto.*;
import demo.server.exception.AppException;
import demo.server.exception.ErrorCode;
import demo.server.mapper.UserMapper;
import demo.server.model.Role;
import demo.server.model.User;
import demo.server.repository.RoleRepository;
import demo.server.repository.UserRepository;
import demo.server.security.JwtTokenProvider;
import demo.server.service.AuthService;
import demo.server.service.EmailService;
import demo.server.service.RedisService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthServiceImpl implements AuthService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    JwtTokenProvider jwtTokenProvider;
    RedisService redisService;
    EmailService emailService;

    static String EMAIL_VERIFY_PREFIX = "EMAIL_VERIFY:";
    static String PASSWORD_RESET_PREFIX = "PWD_RESET:";

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(false);

        // Fetch or create Role
        Role userRole = roleRepository.findById("ROLE_USER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name("ROLE_USER")
                                .description("Default regular user role")
                                .permissions(new HashSet<>())
                                .build()
                ));

        user.setRoles(Set.of(userRole));
        User savedUser = userRepository.save(user);

        // Send Email Verification Code
        String otp = generateOtp();
        redisService.set(EMAIL_VERIFY_PREFIX + user.getEmail(), otp, 10, TimeUnit.MINUTES);
        emailService.sendVerificationEmail(user.getEmail(), otp);

        String accessToken = jwtTokenProvider.generateToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Generate Tokens
        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (jwtTokenProvider.isTokenExpired(token)) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        String email = jwtTokenProvider.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!jwtTokenProvider.validateToken(token, user.getEmail())) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String newAccessToken = jwtTokenProvider.generateToken(user);
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(token)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String token = authHeader.substring(7);
        try {
            long expiration = jwtTokenProvider.extractExpiration(token).getTime();
            long now = System.currentTimeMillis();
            long durationInSeconds = Math.max((expiration - now) / 1000, 0);

            if (durationInSeconds > 0) {
                redisService.blacklistToken(token, durationInSeconds);
            }
        } catch (Exception e) {
            log.error("Lỗi khi giải mã token đăng xuất: {}", e.getMessage());
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        String redisOtp = (String) redisService.get(EMAIL_VERIFY_PREFIX + request.getEmail());
        if (redisOtp == null || !redisOtp.equals(request.getCode())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setEmailVerified(true);
        userRepository.save(user);
        redisService.delete(EMAIL_VERIFY_PREFIX + request.getEmail());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String otp = generateOtp();
        redisService.set(PASSWORD_RESET_PREFIX + request.getEmail(), otp, 5, TimeUnit.MINUTES);
        emailService.sendOtpEmail(request.getEmail(), otp);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String redisOtp = (String) redisService.get(PASSWORD_RESET_PREFIX + request.getEmail());
        if (redisOtp == null || !redisOtp.equals(request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        redisService.delete(PASSWORD_RESET_PREFIX + request.getEmail());
    }

    private String generateOtp() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
