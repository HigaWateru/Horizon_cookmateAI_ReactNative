package demo.server.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IngredientResponse {
    String id;
    String name;
    Double quantity;
    String unit;
    BigDecimal price;
    String storageLocation;
    LocalDate purchaseDate;
    LocalDate expiryDate;
    long daysLeft; // Computed dynamic value (expiryDate - now)
    String icon;
    String category;
    String note;
}
