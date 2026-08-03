package demo.server.service.impl;

import demo.server.common.PageResponse;
import demo.server.dto.IngredientRequest;
import demo.server.dto.IngredientResponse;
import demo.server.exception.AppException;
import demo.server.exception.ErrorCode;
import demo.server.mapper.IngredientMapper;
import demo.server.model.Ingredient;
import demo.server.model.User;
import demo.server.repository.IngredientRepository;
import demo.server.service.IngredientService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IngredientServiceImpl implements IngredientService {

    IngredientRepository ingredientRepository;
    IngredientMapper ingredientMapper;

    @Override
    public IngredientResponse create(IngredientRequest request, User currentUser) {
        Ingredient ingredient = ingredientMapper.toIngredient(request);
        ingredient.setUser(currentUser);
        ingredient.setPurchaseDate(LocalDate.now());
        ingredient.setExpiryDate(LocalDate.now().plusDays(request.getExpiryDays()));

        Ingredient saved = ingredientRepository.save(ingredient);
        return ingredientMapper.toIngredientResponse(saved);
    }

    @Override
    public IngredientResponse update(String id, IngredientRequest request, User currentUser) {
        Ingredient ingredient = getEntityAndVerifyOwner(id, currentUser);
        ingredientMapper.updateIngredient(request, ingredient);
        
        // Re-calculate expiry date
        ingredient.setExpiryDate(LocalDate.now().plusDays(request.getExpiryDays()));
        
        Ingredient updated = ingredientRepository.save(ingredient);
        return ingredientMapper.toIngredientResponse(updated);
    }

    @Override
    public void delete(String id, User currentUser) {
        Ingredient ingredient = getEntityAndVerifyOwner(id, currentUser);
        ingredientRepository.delete(ingredient);
    }

    @Override
    public IngredientResponse getById(String id, User currentUser) {
        Ingredient ingredient = getEntityAndVerifyOwner(id, currentUser);
        return ingredientMapper.toIngredientResponse(ingredient);
    }

    @Override
    public PageResponse<IngredientResponse> getAll(
            User currentUser,
            String search,
            String category,
            String storageLocation,
            int page,
            int size,
            String sortBy,
            String order
    ) {
        // Map dynamic DTO field "daysLeft" sorting to database column "expiryDate"
        String sortProperty = sortBy;
        if ("daysLeft".equalsIgnoreCase(sortBy)) {
            sortProperty = "expiryDate";
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortProperty);
        
        // Spring Data JPA pages are 0-indexed, while API uses 1-indexed
        int pageIndex = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(pageIndex, size, sort);

        // Normalize filter values
        String searchFilter = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String categoryFilter = (category != null && !category.trim().isEmpty() && !"Tất cả".equalsIgnoreCase(category)) ? category.trim() : null;
        String storageFilter = (storageLocation != null && !storageLocation.trim().isEmpty()) ? storageLocation.trim() : null;

        Page<Ingredient> ingredientPage = ingredientRepository.findByFilters(
                currentUser, searchFilter, categoryFilter, storageFilter, pageable
        );

        List<IngredientResponse> responses = ingredientPage.getContent().stream()
                .map(ingredientMapper::toIngredientResponse)
                .collect(Collectors.toList());

        return PageResponse.<IngredientResponse>builder()
                .content(responses)
                .page(page)
                .size(size)
                .totalElements(ingredientPage.getTotalElements())
                .totalPages(ingredientPage.getTotalPages())
                .last(ingredientPage.isLast())
                .build();
    }

    private Ingredient getEntityAndVerifyOwner(String id, User currentUser) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST)); // Or Ingredient not found

        if (!ingredient.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return ingredient;
    }
}
