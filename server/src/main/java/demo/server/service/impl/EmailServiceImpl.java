package demo.server.service.impl;

import demo.server.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "CookMate AI - Mã OTP của bạn";
        String content = "Xin chào,\n\nMã OTP để khôi phục mật khẩu của bạn là: " + otp + "\nMã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.";
        
        log.info("[OTP VERIFICATION] Gửi mã OTP [{}] tới email {}", otp, toEmail);
        
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
            } catch (Exception e) {
                log.warn("Không thể gửi email OTP thực tế: {}. Vui lòng lấy mã OTP từ log hệ thống bên trên để tiếp tục.", e.getMessage());
            }
        }
    }

    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "CookMate AI - Xác thực địa chỉ email";
        String content = "Xin chào,\n\nVui lòng xác thực tài khoản CookMate AI của bạn bằng mã xác thực dưới đây:\n" + token + "\n\nCảm ơn bạn đã đồng hành cùng CookMate AI.";
        
        log.info("[EMAIL VERIFICATION] Gửi mã xác thực [{}] tới email {}", token, toEmail);
        
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
            } catch (Exception e) {
                log.warn("Không thể gửi email xác nhận thực tế: {}. Vui lòng lấy mã xác nhận từ log hệ thống bên trên để tiếp tục.", e.getMessage());
            }
        }
    }
}
