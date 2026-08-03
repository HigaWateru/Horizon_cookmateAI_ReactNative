package demo.server.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Mã lỗi không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Người dùng đã tồn tại trên hệ thống", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Tên người dùng không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Mật khẩu phải có ít nhất 8 ký tự", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Chưa xác thực tài khoản", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền truy cập chức năng này", HttpStatus.FORBIDDEN),
    INVALID_OTP(1008, "Mã OTP không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1009, "Email chưa được xác thực", HttpStatus.BAD_REQUEST),
    TOKEN_EXPIRED(1010, "Mã token đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN(1011, "Mã token không hợp lệ", HttpStatus.UNAUTHORIZED),
    INVALID_REQUEST(1012, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1013, "Vai trò không tồn tại", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_FOUND(1014, "Quyền hạn không tồn tại", HttpStatus.NOT_FOUND),
    EMAIL_SEND_FAILED(1015, "Gửi email thất bại", HttpStatus.INTERNAL_SERVER_ERROR)
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
