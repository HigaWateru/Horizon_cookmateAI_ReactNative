package demo.server.repository;

import demo.server.model.Ingredient;
import demo.server.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, String> {
    
    List<Ingredient> findByUser(User user);
    
    @Query("SELECT i FROM Ingredient i WHERE i.user = :user " +
            "AND (:search IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:category IS NULL OR i.category = :category) " +
            "AND (:storageLocation IS NULL OR i.storageLocation = :storageLocation)")
    Page<Ingredient> findByFilters(
            @Param("user") User user,
            @Param("search") String search,
            @Param("category") String category,
            @Param("storageLocation") String storageLocation,
            Pageable pageable
    );
}

