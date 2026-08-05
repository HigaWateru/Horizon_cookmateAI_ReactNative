package demo.server.service;

import demo.server.dto.RecipeResponse;
import demo.server.model.User;

import java.util.List;

public interface RecipeService {
    List<RecipeResponse> getRecommendations(User currentUser);
}
