package demo.server.service;

import demo.server.common.PageResponse;
import demo.server.dto.IngredientRequest;
import demo.server.dto.IngredientResponse;
import demo.server.model.User;

public interface IngredientService {
    IngredientResponse create(IngredientRequest request, User currentUser);
    
    IngredientResponse update(String id, IngredientRequest request, User currentUser);
    
    void delete(String id, User currentUser);
    
    PageResponse<IngredientResponse> getAll(
            User currentUser,
            String search,
            String category,
            String storageLocation,
            int page,
            int size,
            String sortBy,
            String order
    );
    
    IngredientResponse getById(String id, User currentUser);
}
