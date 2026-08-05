import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { ingredientTags, recipes, Recipe } from '../data/mockData';
import { recipeService } from '../services/recipe.service';
import tokenStorage from '../services/tokenStorage';

const categories = ['Tất cả', 'Sắp hết hạn', 'Không cần mua'];

export default function RecipesScreen() {
  // Navigation states: 'search' | 'detail'
  const [step, setStep] = useState<'search' | 'detail'>('search');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);

  // Search/Filter states
  const [activeCategory, setActiveCategory] = useState('Sắp hết hạn');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Rau muống', 'Thịt heo']);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagsOpen, setTagsOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [recipesList, setRecipesList] = useState<Recipe[]>(recipes);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await recipeService.getRecommendations();
      if (response && response.result) {
        setRecipesList(response.result);
      }
    } catch (err) {
      console.error('Failed to fetch recipe recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  // Search suggestions in tag cloud
  const filteredTags = useMemo(() => {
    if (!normalizedSearchQuery) return ingredientTags;
    return ingredientTags.filter((tag) => tag.toLowerCase().includes(normalizedSearchQuery));
  }, [normalizedSearchQuery]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((t) => t !== tag);
      }
      return [...current, tag];
    });
  };

  const matchesSearchQuery = (recipe: Recipe) => {
    if (!normalizedSearchQuery) return true;
    const name = recipe.name.toLowerCase();
    const ingr = recipe.ingredients.join(' ').toLowerCase();
    return name.includes(normalizedSearchQuery) || ingr.includes(normalizedSearchQuery);
  };

  // Rank recipes by how many ingredients match selectedTags
  const rankedRecipes = useMemo(() => {
    return recipesList
      .map((recipe) => {
        const selectedMatches = recipe.ingredients.filter((ingr) =>
          selectedTags.includes(ingr)
        ).length;
        return { ...recipe, selectedMatches };
      })
      .filter((recipe) => {
        // filter by category
        if (activeCategory === 'Sắp hết hạn') {
          // just mock filtering for demo: "Thịt xào rau muống" uses vegetables, etc.
          // let's show all for simplicity or filter by some tags
        } else if (activeCategory === 'Không cần mua') {
          if (recipe.extraCost !== '0đ') return false;
        }

        return (selectedTags.length === 0 || recipe.selectedMatches > 0) && matchesSearchQuery(recipe);
      })
      .sort((a, b) => {
        if (b.selectedMatches !== a.selectedMatches) {
          return b.selectedMatches - a.selectedMatches;
        }
        return b.match - a.match;
      });
  }, [selectedTags, searchQuery, activeCategory]);

  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setStep('detail');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {toast ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {step === 'search' && (
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.screenTitleRow}>
            <View>
              <Text style={styles.eyebrow}>Lọc theo đồ sẵn có</Text>
              <Text style={styles.screenTitle}>Gợi ý món ăn</Text>
            </View>
          </View>

          {/* Ingredient picker */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nguyên liệu trong kho..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setTagsOpen(true)}
            />
          </View>

          {/* Selected tags chips row */}
          <View style={styles.chipsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.selectedChip}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={styles.selectedChipText}>{tag}  ×</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptySelectionText}>Chưa chọn nguyên liệu lọc</Text>
              )}
            </ScrollView>
          </View>

          {/* Tag cloud if open */}
          {tagsOpen && (
            <View style={styles.tagCloud}>
              <View style={styles.cloudHeader}>
                <Text style={styles.cloudTitle}>Tag nguyên liệu</Text>
                <TouchableOpacity onPress={() => setTagsOpen(false)}>
                  <Text style={styles.cloudClose}>Đóng</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsGrid}>
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Category Rail (Rendered as horizontal tabs on mobile) */}
          <View style={styles.categoryTabs}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryTabText, activeCategory === cat && styles.categoryTabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.helperText}>Chọn tag để lọc món có thể nấu</Text>

          {/* Recipes results list */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.recipesList}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchRecommendations} colors={['#11876d']} />
            }
          >
            {rankedRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => handleOpenRecipe(recipe)}
                activeOpacity={0.8}
              >
                <View style={styles.recipeIconBg}>
                  <Text style={styles.recipeIcon}>{recipe.icon}</Text>
                </View>
                <View style={styles.recipeInfo}>
                  <View style={styles.recipeTitleRow}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <Text style={styles.recipeMatch}>{recipe.match}%</Text>
                  </View>
                  <Text style={styles.recipeReason} numberOfLines={1}>
                    {recipe.reason}
                  </Text>
                  <View style={styles.recipeMetaRow}>
                    <Text style={styles.recipeMetaText}>⏱ {recipe.time}</Text>
                    <Text style={[styles.recipeMetaText, styles.recipeMetaPrice]}>💰 {recipe.costLabel}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {rankedRecipes.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy món ăn phù hợp.</Text>
            )}
          </ScrollView>
        </View>
      )}

      {step === 'detail' && (
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep('search')}>
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
            <View style={styles.detailHeaderTitle}>
              <Text style={styles.eyebrow}>CookMate đề xuất</Text>
              <Text style={styles.screenTitle}>Chi tiết món ăn</Text>
            </View>
            <View style={styles.matchPill}>
              <Text style={styles.matchPillText}>{selectedRecipe.match}%</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
            <View style={styles.detailCard}>
              {/* Photo Plate representation */}
              <View style={styles.plateContainer}>
                <View style={styles.plate}>
                  <Text style={styles.plateEmoji}>{selectedRecipe.icon}</Text>
                </View>
                <View style={styles.plateCaption}>
                  <Text style={styles.plateCaptionCategory}>Bữa tối tiết kiệm</Text>
                  <Text style={styles.plateCaptionTitle}>{selectedRecipe.name}</Text>
                </View>
              </View>

              {/* Title & description */}
              <View style={styles.detailCopy}>
                <Text style={styles.detailName}>{selectedRecipe.name}</Text>
                <Text style={styles.detailReason}>{selectedRecipe.reason}</Text>
              </View>

              {/* Metrics */}
              <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{selectedRecipe.match}%</Text>
                  <Text style={styles.metricLbl}>phù hợp</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{selectedRecipe.time}</Text>
                  <Text style={styles.metricLbl}>thời gian</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{selectedRecipe.extraCost}</Text>
                  <Text style={styles.metricLbl}>chi phí thêm</Text>
                </View>
              </View>

              {/* Cook button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => showToast('Món ăn đang được chuẩn bị nấu!')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Nấu món này</Text>
              </TouchableOpacity>
            </View>

            {/* Shopping box warning info */}
            <View style={styles.shoppingBox}>
              <Text style={styles.shoppingTitle}>Cần mua thêm</Text>
              <Text style={styles.shoppingValue}>{selectedRecipe.buyMore}</Text>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfffd',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  screenTitleRow: {
    marginBottom: 16,
  },
  eyebrow: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: '#102f28',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    color: '#11876d',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#16342d',
    fontSize: 15,
    padding: 0,
  },
  chipsRow: {
    height: 36,
    marginBottom: 16,
  },
  chipsScroll: {
    gap: 8,
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#e8f8f2',
    borderWidth: 1,
    borderColor: '#11876d',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 28,
    justifyContent: 'center',
  },
  selectedChipText: {
    color: '#11876d',
    fontSize: 12,
    fontWeight: '700',
  },
  emptySelectionText: {
    color: '#6e8981',
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Tag cloud dropdown
  tagCloud: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  cloudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fbf7',
    paddingBottom: 6,
  },
  cloudTitle: {
    color: '#102f28',
    fontSize: 13,
    fontWeight: '800',
  },
  cloudClose: {
    color: '#ff7d4d',
    fontSize: 13,
    fontWeight: '800',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagButton: {
    backgroundColor: '#fbfffd',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagButtonSelected: {
    backgroundColor: '#e8f8f2',
    borderColor: '#11876d',
  },
  tagText: {
    color: '#16342d',
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextSelected: {
    color: '#11876d',
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#e8f8f2',
    borderRadius: 12,
    padding: 4,
    height: 44,
    marginBottom: 12,
  },
  categoryTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabText: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTabTextActive: {
    color: '#11876d',
  },
  helperText: {
    color: '#6e8981',
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  recipesList: {
    gap: 12,
    paddingBottom: 24,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2f5ee',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  recipeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eefbf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  recipeIcon: {
    fontSize: 24,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeName: {
    color: '#16342d',
    fontSize: 15,
    fontWeight: '800',
  },
  recipeMatch: {
    color: '#11876d',
    fontSize: 14,
    fontWeight: '800',
  },
  recipeReason: {
    color: '#6e8981',
    fontSize: 12,
    marginTop: 4,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  recipeMetaText: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#f4faf7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recipeMetaPrice: {
    color: '#11876d',
    backgroundColor: '#eefbf6',
  },
  emptyText: {
    color: '#6e8981',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 40,
  },
  // Detail mode styles
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailHeaderTitle: {
    flex: 1,
    paddingLeft: 12,
  },
  backButton: {
    paddingRight: 6,
  },
  backChevron: {
    fontSize: 32,
    color: '#11876d',
    lineHeight: 32,
  },
  matchPill: {
    backgroundColor: '#eefbf6',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  matchPillText: {
    color: '#11876d',
    fontSize: 13,
    fontWeight: '800',
  },
  detailScroll: {
    paddingBottom: 40,
    gap: 16,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  plateContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    backgroundColor: '#effcf7',
    borderWidth: 1,
    borderColor: '#d9f1ea',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  plate: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  plateEmoji: {
    fontSize: 44,
  },
  plateCaption: {
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
  plateCaptionCategory: {
    color: '#11876d',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  plateCaptionTitle: {
    color: '#102f28',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  detailCopy: {
    marginBottom: 20,
  },
  detailName: {
    color: '#102f28',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  detailReason: {
    color: '#6e8981',
    fontSize: 14,
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#caeae0',
    paddingVertical: 14,
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    color: '#11876d',
    fontSize: 18,
    fontWeight: '900',
  },
  metricLbl: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#11876d',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#11876d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  shoppingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  shoppingTitle: {
    color: '#6e8981',
    fontSize: 14,
    fontWeight: '700',
  },
  shoppingValue: {
    color: '#ff7d4d',
    fontSize: 14,
    fontWeight: '800',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#16342d',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
