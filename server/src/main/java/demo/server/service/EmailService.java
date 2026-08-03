package demo.server.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp);
    void sendVerificationEmail(String toEmail, String token);
}
