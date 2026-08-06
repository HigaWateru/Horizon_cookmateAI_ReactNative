import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ingredients as initialIngredients,
  ingredientCategoryGroups,
  ingredientUnits,
  storageOptions,
  Ingredient,
} from '../data/mockData';
import { inventoryService } from '../services/inventory.service';
import tokenStorage from '../services/tokenStorage';

// Expiry tone logic
const getExpiryTone = (daysLeft: number) => {
  if (daysLeft <= 1) return 'danger';
  if (daysLeft <= 2) return 'warning';
  return 'fresh';
};

const getToneColor = (tone: string) => {
  switch (tone) {
    case 'danger':
      return { bg: '#ffece5', border: '#ffd5c6', text: '#ff7d4d' };
    case 'warning':
      return { bg: '#fff7e5', border: '#ffe8b3', text: '#ffb200' };
    default:
      return { bg: '#eefbf6', border: '#caeae0', text: '#11876d' };
  }
};

// Shelf life suggestion logic
const meatKeywords = ['thịt gà', 'thịt lợn', 'thịt bò', 'thịt heo'];
const seafoodKeywords = ['cá', 'tôm', 'mực'];
const greensKeywords = ['rau', 'cải', 'hành lá'];
const eggKeywords = ['trứng'];
const dryKeywords = ['muối', 'đường', 'nước mắm', 'dầu ăn', 'hạt nêm', 'gạo', 'mì', 'miến', 'nấm khô'];

const getShelfLifeSuggestion = (name: string, storage: string) => {
  const normalizedName = name.trim().toLowerCase();
  if (meatKeywords.some((k) => normalizedName.includes(k))) {
    return storage === 'Ngăn đá' ? 30 : 2;
  }
  if (seafoodKeywords.some((k) => normalizedName.includes(k))) {
    return storage === 'Ngăn đá' ? 20 : 1;
  }
  if (greensKeywords.some((k) => normalizedName.includes(k))) {
    return storage === 'Ngăn mát' ? 2 : 3;
  }
  if (eggKeywords.some((k) => normalizedName.includes(k))) {
    return storage === 'Ngăn mát' ? 14 : 3;
  }
  if (dryKeywords.some((k) => normalizedName.includes(k))) {
    return storage === 'Bên ngoài' ? 90 : 3;
  }
  return 3;
};

export default function InventoryScreen() {
  // Navigation states: 'list' | 'select' | 'form'
  const [step, setStep] = useState<'list' | 'select' | 'form'>('list');

  // List states
  const [listQuery, setListQuery] = useState('');
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>(initialIngredients);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token || token === 'demo_access_token') return;

    setLoading(true);
    try {
      const response = await inventoryService.getAll({ size: 100 });
      if (response && response.result && response.result.content) {
        const mapped = response.result.content.map((item: any) => ({
          id: item.id,
          name: item.name,
          amount: `${item.quantity} ${item.unit}`,
          daysLeft: item.daysLeft,
          icon: item.icon || '🥬',
        }));
        setIngredientsList(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Add states
  const [activeCategoryId, setActiveCategoryId] = useState(ingredientCategoryGroups[0].id);
  const [addQuery, setAddQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [toast, setToast] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('gram');
  const [formPrice, setFormPrice] = useState('');
  const [formStorage, setFormStorage] = useState('Ngăn mát');
  const [formExpiryDays, setFormExpiryDays] = useState('');
  const [expiryTouched, setExpiryTouched] = useState(false);

  // Suggested days
  const suggestedDays = useMemo(() => {
    return getShelfLifeSuggestion(formName, formStorage);
  }, [formName, formStorage]);

  const displayedExpiryDays = expiryTouched ? formExpiryDays : suggestedDays.toString();

  // Search filtered ingredients in inventory
  const filteredIngredients = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    if (!query) return ingredientsList;
    return ingredientsList.filter((item) => item.name.toLowerCase().includes(query));
  }, [ingredientsList, listQuery]);

  // Tags filter logic in select step
  const activeCategory = useMemo(() => {
    return ingredientCategoryGroups.find((cat) => cat.id === activeCategoryId);
  }, [activeCategoryId]);

  const allTags = useMemo(() => {
    return ingredientCategoryGroups.flatMap((group) =>
      group.tags.map((tag) => ({ groupName: group.name, name: tag }))
    );
  }, []);

  const visibleTags = useMemo(() => {
    const query = addQuery.trim().toLowerCase();
    if (query) {
      return allTags.filter((tag) => tag.name.toLowerCase().includes(query)).map((t) => t.name);
    }
    return activeCategory ? activeCategory.tags : [];
  }, [activeCategory, addQuery, allTags]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('select');
      return;
    }
    if (step === 'select') {
      setStep('list');
      return;
    }
  };

  const handleGoToForm = () => {
    setFormName(selectedTag || addQuery || '');
    setFormQuantity('');
    setFormUnit('gram');
    setFormPrice('');
    setFormStorage('Ngăn mát');
    setFormExpiryDays('');
    setExpiryTouched(false);
    setStep('form');
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên nguyên liệu.');
      return;
    }
    if (!formQuantity || Number(formQuantity) <= 0) {
      showToast('Vui lòng nhập số lượng hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const priceVal = formPrice.trim() ? Number(formPrice) : undefined;
      const expDays = displayedExpiryDays ? Number(displayedExpiryDays) : 3;

      await inventoryService.create({
        name: formName.trim(),
        quantity: Number(formQuantity),
        unit: formUnit,
        price: priceVal,
        storageLocation: formStorage,
        icon: '🥬',
        category: 'Khác',
        expiryDays: expDays,
      });

      showToast('Thêm nguyên liệu thành công.');
      setTimeout(() => {
        setStep('list');
        setSelectedTag('');
        setAddQuery('');
        fetchInventory();
      }, 1000);
    } catch (err) {
      console.error('Failed to create ingredient:', err);
      showToast('Lỗi khi thêm nguyên liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {toast ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {step === 'list' && (
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.screenTitleRow}>
            <View>
              <Text style={styles.eyebrow}>Tủ lạnh hôm nay</Text>
              <Text style={styles.screenTitle}>Kho nguyên liệu</Text>
            </View>
            <TouchableOpacity style={styles.roundAddButton} onPress={() => setStep('select')}>
              <Text style={styles.addSign}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nguyên liệu..."
              placeholderTextColor="#999"
              value={listQuery}
              onChangeText={setListQuery}
            />
          </View>

          {/* Ingredients list */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollList}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchInventory} colors={['#11876d']} />
            }
          >
            {filteredIngredients.map((item) => {
              const tone = getExpiryTone(item.daysLeft);
              const colors = getToneColor(tone);
              return (
                <View style={styles.ingredientCard} key={item.id}>
                  <View style={[styles.ingredientThumb, { backgroundColor: colors.bg }]}>
                    <Text style={styles.ingredientIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientAmount}>{item.amount}</Text>
                  </View>
                  <View style={[styles.expiryBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.expiryText, { color: colors.text }]}>còn {item.daysLeft} ngày</Text>
                  </View>
                </View>
              );
            })}
            {filteredIngredients.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy nguyên liệu phù hợp trong kho</Text>
            )}
          </ScrollView>
        </View>
      )}

      {step === 'select' && (
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.addHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.eyebrow}>Kho nguyên liệu</Text>
              <Text style={styles.screenTitle}>Thêm vào kho</Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={[styles.searchBar, { marginBottom: 12 }]}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nguyên liệu..."
              placeholderTextColor="#999"
              value={addQuery}
              onChangeText={(text) => {
                setAddQuery(text);
                setSelectedTag('');
              }}
            />
          </View>

          {/* Categories chips */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsScroll}>
              {ingredientCategoryGroups.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, activeCategoryId === cat.id && styles.categoryChipActive]}
                  onPress={() => {
                    setActiveCategoryId(cat.id);
                    setAddQuery('');
                    setSelectedTag('');
                  }}
                >
                  <Text style={[styles.categoryChipText, activeCategoryId === cat.id && styles.categoryChipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags cloud */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
            <View style={styles.addSectionTitleRow}>
              <Text style={styles.eyebrow}>
                {addQuery.trim() ? `Kết quả cho "${addQuery.trim()}"` : activeCategory?.name}
              </Text>
              <Text style={styles.addSectionSubtitle}>Chọn nhanh nguyên liệu</Text>
            </View>

            {visibleTags.length > 0 ? (
              <View style={styles.tagsGrid}>
                {visibleTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagButton, selectedTag === tag && styles.tagButtonSelected]}
                    onPress={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  >
                    <Text style={[styles.tagText, selectedTag === tag && styles.tagTextSelected]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyTagsText}>Không tìm thấy nguyên liệu phù hợp.</Text>
            )}
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoToForm} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>{selectedTag || addQuery ? 'Xác nhận' : 'Bỏ qua'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'form' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.addHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.eyebrow}>Kho nguyên liệu</Text>
              <Text style={styles.screenTitle}>Thêm vào kho</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            {/* Demo warning */}
            <View style={styles.demoLockBanner}>
              <Text style={styles.demoLockTitle}>Chế độ demo</Text>
              <Text style={styles.demoLockSubtitle}>Dữ liệu đang được fix cứng để trình bày UI/UX, không thêm sửa xoá.</Text>
            </View>

            <Text style={styles.formEyebrow}>Thông tin chi tiết</Text>
            <Text style={styles.formTitle}>Form thêm nguyên liệu</Text>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên nguyên liệu</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên nguyên liệu"
                placeholderTextColor="#999"
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <View style={styles.formGrid}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Số lượng</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nhập số lượng"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formQuantity}
                  onChangeText={setFormQuantity}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Đơn vị</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitScroll}>
                  {ingredientUnits.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, formUnit === u && styles.unitChipActive]}
                      onPress={() => setFormUnit(u)}
                    >
                      <Text style={[styles.unitChipText, formUnit === u && styles.unitChipTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá tiền</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Không bắt buộc"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formPrice}
                onChangeText={setFormPrice}
              />
            </View>

            {/* Storage options */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nơi bảo quản</Text>
              <View style={styles.storageSegment}>
                {storageOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.storageButton, formStorage === opt && styles.storageButtonActive]}
                    onPress={() => setFormStorage(opt)}
                  >
                    <Text style={[styles.storageText, formStorage === opt && styles.storageTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Expiry Suggestion */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hạn sử dụng (ngày)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={displayedExpiryDays}
                onChangeText={(text) => {
                  setExpiryTouched(true);
                  setFormExpiryDays(text);
                }}
              />
              <Text style={styles.formSuggestionText}>
                CookMate gợi ý {suggestedDays} ngày theo nguyên liệu và nơi bảo quản.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Ví dụ: mua ở chợ, nên dùng trước cuối tuần"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={formPrice} // mapping not stored in state for demo
              />
            </View>

            <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Lưu vào kho</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  roundAddButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e8f8f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSign: {
    color: '#11876d',
    fontSize: 24,
    fontWeight: '900',
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
    marginBottom: 20,
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
  scrollList: {
    gap: 12,
    paddingBottom: 24,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2f5ee',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  ingredientThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ingredientIcon: {
    fontSize: 22,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: '#16342d',
    fontSize: 15,
    fontWeight: '800',
  },
  ingredientAmount: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  expiryBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyText: {
    color: '#6e8981',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 40,
  },
  // Add step styles
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 12,
  },
  backChevron: {
    fontSize: 32,
    color: '#11876d',
    lineHeight: 32,
  },
  categoriesContainer: {
    height: 38,
    marginBottom: 16,
  },
  categoryChipsScroll: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#11876d',
    borderColor: '#11876d',
  },
  categoryChipText: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  tagsContainer: {
    paddingBottom: 24,
  },
  addSectionTitleRow: {
    marginBottom: 16,
  },
  addSectionSubtitle: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagButtonSelected: {
    backgroundColor: '#e8f8f2',
    borderColor: '#11876d',
  },
  tagText: {
    color: '#16342d',
    fontSize: 13,
    fontWeight: '700',
  },
  tagTextSelected: {
    color: '#11876d',
  },
  emptyTagsText: {
    color: '#6e8981',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
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
  // Form step styles
  formScroll: {
    paddingBottom: 40,
  },
  demoLockBanner: {
    backgroundColor: '#fff7e5',
    borderWidth: 1,
    borderColor: '#ffe8b3',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  demoLockTitle: {
    color: '#b27a00',
    fontSize: 13,
    fontWeight: '800',
  },
  demoLockSubtitle: {
    color: '#ffb200',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  formEyebrow: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formTitle: {
    color: '#102f28',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#16342d',
    backgroundColor: '#ffffff',
    fontSize: 15,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  unitScroll: {
    height: 48,
    alignItems: 'center',
    gap: 6,
  },
  unitChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
  },
  unitChipActive: {
    backgroundColor: '#e8f8f2',
    borderColor: '#11876d',
  },
  unitChipText: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
  },
  unitChipTextActive: {
    color: '#11876d',
  },
  storageSegment: {
    flexDirection: 'row',
    backgroundColor: '#e8f8f2',
    borderRadius: 12,
    padding: 4,
    height: 46,
  },
  storageButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  storageButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storageText: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
  },
  storageTextActive: {
    color: '#11876d',
  },
  formSuggestionText: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    fontStyle: 'italic',
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
