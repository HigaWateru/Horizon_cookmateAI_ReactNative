import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { dashboardService, DashboardStatsResponse, GroupStats } from '../services/dashboard.service';
import tokenStorage from '../services/tokenStorage';

const { width } = Dimensions.get('window');

const formatVnd = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.max(value, 0)) + 'đ';
};

const formatShortVnd = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return Math.round(value / 1000) + 'K';
  }
  return value + 'đ';
};

export default function StatisticsScreen() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'inventory'>('expenses');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      setError('Bạn cần đăng nhập để xem thống kê.');
      return;
    }
    if (token === 'demo_access_token') {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getStatistics();
      if (response && response.result) {
        setStats(response.result);
      } else {
        setError('Không nhận được dữ liệu từ hệ thống.');
      }
    } catch (err: any) {
      console.warn('Failed to fetch dashboard statistics', err);
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#11876d" />
        <Text style={styles.loadingText}>Đang tải dữ liệu báo cáo...</Text>
      </SafeAreaView>
    );
  }

  // Fallback defaults if no statistics loaded or in case of errors
  const currentStats: DashboardStatsResponse = stats || {
    totalIngredients: 0,
    expiringIngredientsCount: 0,
    expiredIngredientsCount: 0,
    totalIngredientValue: 0,
    budgetLimit: 1500000,
    totalSpent: 0,
    remainingBudget: 1500000,
    budgetStatus: 'NORMAL',
    wastedValueEstimation: 0,
    categorySpentBreakdown: [],
    storageLocationBreakdown: [],
    categoryIngredientBreakdown: [],
    dailySpendHistory: [],
    monthlySpendHistory: [],
  };

  // Spent Percentage calculations
  const budgetLimit = currentStats.budgetLimit || 1500000;
  const totalSpent = currentStats.totalSpent || 0;
  const spentPercent = budgetLimit > 0 ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100) : 0;
  const remainingBudget = Math.max(budgetLimit - totalSpent, 0);

  // Maximum spend in monthly history for chart scaling
  const maxMonthlySpend = currentStats.monthlySpendHistory.length > 0
    ? Math.max(...currentStats.monthlySpendHistory.map(m => m.amount), 100000)
    : 1000000;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Báo cáo & Thống kê</Text>
        <View style={{ width: 60 }} /> {/* balance layout */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStats} colors={['#11876d']} />
        }
      >
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dynamic Metric Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>💵</Text>
            <Text style={styles.metricValue}>{formatShortVnd(totalSpent)}</Text>
            <Text style={styles.metricLabel}>Đã chi tiêu</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>🥬</Text>
            <Text style={styles.metricValue}>{currentStats.totalIngredients}</Text>
            <Text style={styles.metricLabel}>Món trong kho</Text>
          </View>
          <View style={[styles.metricCard, currentStats.expiringIngredientsCount + currentStats.expiredIngredientsCount > 0 && styles.metricCardWarning]}>
            <Text style={styles.metricEmoji}>⚠️</Text>
            <Text style={[styles.metricValue, currentStats.expiringIngredientsCount + currentStats.expiredIngredientsCount > 0 && styles.metricValueWarning]}>
              {currentStats.expiringIngredientsCount + currentStats.expiredIngredientsCount}
            </Text>
            <Text style={styles.metricLabel}>Cần dùng gấp</Text>
          </View>
        </View>

        {/* Tabs switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'expenses' && styles.tabActive]}
            onPress={() => setActiveTab('expenses')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>📈 Chi tiêu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'inventory' && styles.tabActive]}
            onPress={() => setActiveTab('inventory')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>🍱 Kho thực phẩm</Text>
          </TouchableOpacity>
        </View>

        {/* Render Tab Expenses */}
        {activeTab === 'expenses' && (
          <View style={styles.tabContent}>
            {/* Budget status card */}
            <View style={[
              styles.sectionCard,
              currentStats.budgetStatus === 'WARNING' && styles.cardWarningBorder,
              currentStats.budgetStatus === 'EXCEEDED' && styles.cardDangerBorder
            ]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Ngân sách tháng này</Text>
                {currentStats.budgetStatus === 'WARNING' && (
                  <View style={styles.badgeWarning}><Text style={styles.badgeText}>Sắp hết</Text></View>
                )}
                {currentStats.budgetStatus === 'EXCEEDED' && (
                  <View style={styles.badgeDanger}><Text style={styles.badgeText}>Vượt hạn mức</Text></View>
                )}
              </View>

              <View style={styles.budgetRow}>
                <View>
                  <Text style={styles.budgetSublabel}>Hạn mức chi tiêu</Text>
                  <Text style={styles.budgetValue}>{formatVnd(budgetLimit)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.budgetSublabel}>Còn lại khả dụng</Text>
                  <Text style={[styles.budgetValue, currentStats.budgetStatus === 'EXCEEDED' && styles.textDanger]}>
                    {formatVnd(remainingBudget)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[
                    styles.progressFill,
                    { width: `${spentPercent}%` },
                    currentStats.budgetStatus === 'WARNING' && styles.progressFillWarning,
                    currentStats.budgetStatus === 'EXCEEDED' && styles.progressFillDanger
                  ]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabelText}>Đã dùng {spentPercent}%</Text>
                  <Text style={styles.progressLabelText}>{formatVnd(totalSpent)}</Text>
                </View>
              </View>
            </View>

            {/* Expenses breakdown by category */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Chi tiêu theo loại</Text>
              <Text style={styles.sectionSubtitle}>Phân bổ chi tiêu thực phẩm tháng này</Text>

              <View style={styles.chartContainer}>
                {currentStats.categorySpentBreakdown.length === 0 ? (
                  <Text style={styles.emptyText}>Chưa có dữ liệu chi tiêu.</Text>
                ) : (
                  currentStats.categorySpentBreakdown.map((item, index) => (
                    <View key={index} style={styles.categoryRow}>
                      <View style={styles.categoryIconContainer}>
                        <Text style={styles.categoryEmoji}>{item.icon}</Text>
                      </View>
                      <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>{item.name}</Text>
                          <Text style={styles.categoryValue}>
                            {formatVnd(item.amount || 0)} ({item.percentage}%)
                          </Text>
                        </View>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Monthly Trend Chart */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Xu hướng chi tiêu</Text>
              <Text style={styles.sectionSubtitle}>Biểu đồ chi tiêu 6 tháng gần nhất</Text>

              {currentStats.monthlySpendHistory.length === 0 ? (
                <Text style={styles.emptyText}>Không có lịch sử chi tiêu.</Text>
              ) : (
                <View style={styles.trendChartWrapper}>
                  <View style={styles.verticalChart}>
                    {currentStats.monthlySpendHistory.map((item, index) => {
                      const barHeight = Math.max((item.amount / maxMonthlySpend) * 120, 8); // scale to max 120px
                      return (
                        <View key={index} style={styles.chartColumn}>
                          <View style={styles.barContainer}>
                            <View style={[styles.verticalBar, { height: barHeight }]} />
                            <Text style={styles.barValueText}>{formatShortVnd(item.amount)}</Text>
                          </View>
                          <Text style={styles.columnLabel}>{item.month}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Render Tab Inventory */}
        {activeTab === 'inventory' && (
          <View style={styles.tabContent}>
            {/* Waste alert card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Ước tính thực phẩm lãng phí</Text>
              <Text style={styles.sectionSubtitle}>Giá trị đồ đã hỏng hoặc sắp hỏng cần dùng ngay</Text>

              <View style={styles.wasteAlertRow}>
                <View style={styles.wasteIconBg}>
                  <Text style={styles.wasteIconEmoji}>🗑️</Text>
                </View>
                <View style={styles.wasteInfo}>
                  <Text style={styles.wasteValue}>{formatVnd(currentStats.wastedValueEstimation)}</Text>
                  <Text style={styles.wasteText}>
                    Có nguy cơ lãng phí nếu không chế biến kịp thời.
                  </Text>
                </View>
              </View>

              <View style={styles.freshnessGaugeRow}>
                <View style={styles.gaugeSegment}>
                  <View style={[styles.gaugeIndicator, { backgroundColor: '#d9384d' }]} />
                  <Text style={styles.gaugeLabel}>Đã hỏng ({currentStats.expiredIngredientsCount})</Text>
                </View>
                <View style={styles.gaugeSegment}>
                  <View style={[styles.gaugeIndicator, { backgroundColor: '#ff7d4d' }]} />
                  <Text style={styles.gaugeLabel}>Gần hết hạn ({currentStats.expiringIngredientsCount})</Text>
                </View>
                <View style={styles.gaugeSegment}>
                  <View style={[styles.gaugeIndicator, { backgroundColor: '#11876d' }]} />
                  <Text style={styles.gaugeLabel}>Còn tươi ngon</Text>
                </View>
              </View>
            </View>

            {/* Storage Location distribution */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Nơi bảo quản</Text>
              <Text style={styles.sectionSubtitle}>Phân bố nguyên liệu trong các khu vực</Text>

              <View style={styles.locationList}>
                {currentStats.storageLocationBreakdown.length === 0 ? (
                  <Text style={styles.emptyText}>Chưa có nguyên liệu nào trong kho.</Text>
                ) : (
                  currentStats.storageLocationBreakdown.map((item, index) => {
                    const totalIngredientsCount = currentStats.totalIngredients || 1;
                    const pct = Math.round((item.count / totalIngredientsCount) * 100);
                    return (
                      <View key={index} style={styles.locationRow}>
                        <Text style={styles.locationEmoji}>{item.icon}</Text>
                        <View style={styles.locationDetails}>
                          <View style={styles.locationHeader}>
                            <Text style={styles.locationName}>{item.name}</Text>
                            <Text style={styles.locationCount}>{item.count} món ({pct}%)</Text>
                          </View>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: '#14b98f' }]} />
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Ingredient categories stats */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Nguyên liệu theo nhóm</Text>
              <Text style={styles.sectionSubtitle}>Phân loại thực phẩm đang lưu giữ</Text>

              <View style={styles.gridCategories}>
                {currentStats.categoryIngredientBreakdown.length === 0 ? (
                  <Text style={styles.emptyText}>Chưa có nguyên liệu nào.</Text>
                ) : (
                  currentStats.categoryIngredientBreakdown.map((item, index) => (
                    <View key={index} style={styles.categoryCard}>
                      <Text style={styles.catCardEmoji}>{item.icon}</Text>
                      <Text style={styles.catCardCount}>{item.count}</Text>
                      <Text style={styles.catCardName}>{item.name}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfffd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbfffd',
  },
  loadingText: {
    color: '#6e8981',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#effcf7',
    backgroundColor: '#ffffff',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0faf6',
  },
  backText: {
    color: '#11876d',
    fontSize: 14,
    fontWeight: '800',
  },
  screenTitle: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  errorCard: {
    backgroundColor: '#ffece5',
    borderWidth: 1,
    borderColor: '#ffd5c6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#b23b10',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ff7d4d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  metricCardWarning: {
    backgroundColor: '#ffece5',
    borderColor: '#ffd5c6',
  },
  metricEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricValue: {
    color: '#11876d',
    fontSize: 18,
    fontWeight: '900',
  },
  metricValueWarning: {
    color: '#b23b10',
  },
  metricLabel: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f8f2',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    color: '#6e8981',
    fontSize: 14,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#11876d',
  },
  tabContent: {
    width: '100%',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  cardWarningBorder: {
    borderColor: '#ffcbb5',
    backgroundColor: '#fffdfc',
  },
  cardDangerBorder: {
    borderColor: '#ffccd3',
    backgroundColor: '#fffdfd',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeWarning: {
    backgroundColor: '#ffece5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeDanger: {
    backgroundColor: '#ffe8eb',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d9384d',
  },
  sectionTitle: {
    color: '#102f28',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetSublabel: {
    color: '#8ba29a',
    fontSize: 11,
    fontWeight: '700',
  },
  budgetValue: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  textDanger: {
    color: '#d9384d',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f0faf6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#11876d',
    borderRadius: 4,
  },
  progressFillWarning: {
    backgroundColor: '#ff7d4d',
  },
  progressFillDanger: {
    backgroundColor: '#d9384d',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelText: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '700',
  },
  chartContainer: {
    marginTop: 8,
    gap: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0faf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    color: '#102f28',
    fontSize: 13,
    fontWeight: '800',
  },
  categoryValue: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#f0faf6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#11876d',
    borderRadius: 3,
  },
  trendChartWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  verticalChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    width: '100%',
    paddingHorizontal: 8,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 130,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  verticalBar: {
    width: 22,
    backgroundColor: '#11876d',
    borderRadius: 6,
  },
  barValueText: {
    color: '#6e8981',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
  columnLabel: {
    color: '#8ba29a',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 8,
  },
  wasteAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffece5',
    borderWidth: 1,
    borderColor: '#ffd5c6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  wasteIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ff7d4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wasteIconEmoji: {
    fontSize: 20,
  },
  wasteInfo: {
    flex: 1,
  },
  wasteValue: {
    color: '#b23b10',
    fontSize: 18,
    fontWeight: '900',
  },
  wasteText: {
    color: '#ff7d4d',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  freshnessGaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  gaugeSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  gaugeLabel: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '700',
  },
  locationList: {
    gap: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  locationName: {
    color: '#102f28',
    fontSize: 13,
    fontWeight: '800',
  },
  locationCount: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '700',
  },
  gridCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: (width - 64 - 10) / 2, // 2 items per row minus padding/gaps
    backgroundColor: '#f5fcf9',
    borderWidth: 1,
    borderColor: '#e2f5ee',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  catCardEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  catCardCount: {
    color: '#102f28',
    fontSize: 16,
    fontWeight: '900',
  },
  catCardName: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyText: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 12,
  },
});
