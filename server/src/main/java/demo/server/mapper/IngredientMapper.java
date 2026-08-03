package demo.server.mapper;

import demo.server.dto.IngredientRequest;
import demo.server.dto.IngredientResponse;
import demo.server.model.Ingredient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface IngredientMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "purchaseDate", ignore = true)
    @Mapping(target = "expiryDate", ignore = true)
    @Mapping(target = "id", ignore = true)
    Ingredient toIngredient(IngredientRequest request);

    @Mapping(target = "daysLeft", expression = "java(java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), ingredient.getExpiryDate()))")
    IngredientResponse toIngredientResponse(Ingredient ingredient);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "purchaseDate", ignore = true)
    @Mapping(target = "expiryDate", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateIngredient(IngredientRequest request, @MappingTarget Ingredient ingredient);
}
