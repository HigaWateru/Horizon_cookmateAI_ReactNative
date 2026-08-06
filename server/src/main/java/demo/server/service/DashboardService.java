package demo.server.service;

import demo.server.dto.DashboardStatsResponse;
import demo.server.model.User;

public interface DashboardService {
    DashboardStatsResponse getStatistics(User currentUser);
}
