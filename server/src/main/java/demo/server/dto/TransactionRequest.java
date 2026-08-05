package demo.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionRequest {
    @NotBlank(message = "Tên khoản chi không được để trống")
    String name;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    BigDecimal amount;

    @NotBlank(message = "Loại chi tiêu không được để trống")
    String category; // "Nguyên liệu", "Đặt đồ ăn", "Ăn ngoài", "Gia vị"

    LocalDate date;

    String note;

    Boolean addToInventory;
}
