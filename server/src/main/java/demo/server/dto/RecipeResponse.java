package demo.server.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecipeResponse {
    String id;
    String name;
    int match;
    String time;
    String costLabel;
    String extraCost;
    String buyMore;
    String reason;
    List<String> ingredients;
    String icon;
}
