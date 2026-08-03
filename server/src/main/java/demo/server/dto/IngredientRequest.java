package demo.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IngredientRequest {
    @NotBlank(message = "Tên nguyên liệu không được để trống")
    String name;

    @NotNull(message = "Số lượng không được để trống")
    @Positive(message = "Số lượng phải lớn hơn 0")
    Double quantity;

    @NotBlank(message = "Đơn vị không được để trống")
    String unit;

    BigDecimal price;

    @NotBlank(message = "Nơi bảo quản không được để trống")
    String storageLocation; // "Ngăn mát", "Ngăn đá", "Bên ngoài"

    String icon;
    String category;

    @NotNull(message = "Hạn sử dụng không được để trống")
    @Positive(message = "Số ngày sử dụng phải lớn hơn 0")
    Integer expiryDays;

    String note;
}
