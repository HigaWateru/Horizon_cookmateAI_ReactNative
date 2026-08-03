package demo.server.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    Double quantity;

    @Column(nullable = false)
    String unit;

    BigDecimal price;

    @Column(nullable = false)
    String storageLocation; // "Ngăn mát", "Ngăn đá", "Bên ngoài"

    @Column(nullable = false)
    LocalDate purchaseDate;

    @Column(nullable = false)
    LocalDate expiryDate;

    String icon;
    String category;
    String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
}
