import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { budgetData } from '../data/mockData';

const expenseTypes = ['Nguyên liệu', 'Đặt đồ ăn', 'Ăn ngoài', 'Gia vị'];

const formatVnd = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.max(value, 0)) + 'đ';
};

export default function BudgetScreen() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Nguyên liệu');
  const [formAddToInventory, setFormAddToInventory] = useState(false);

  const spent = budgetData.spent;
  const remaining = Math.max(budgetData.budgetLimit - spent, 0);
  const spentPercent = Math.min(Math.round((spent / budgetData.budgetLimit) * 100), 100);
  const remainingPercent = Math.round((remaining / budgetData.budgetLimit) * 100);
  const dailySuggestion = Math.floor(remaining / budgetData.daysLeft);
  const isLowBudget = remainingPercent < 30;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setFormName('');
    setFormAmount('');
    setFormCategory('Nguyên liệu');
    setFormAddToInventory(false);
  };

  const saveExpense = () => {
    const amount = Number(formAmount);
    const name = formName.trim();

    if (!name) {
      showToast('Vui lòng nhập tên khoản chi.');
      return;
    }
    if (!amount || amount < 0) {
      showToast('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    showToast('Demo UI/UX: dữ liệu cố định, không lưu khoản chi mới.');
    closeSheet();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {toast ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.budgetHeader}>
          <View>
            <Text style={styles.eyebrow}>{budgetData.monthLabel}</Text>
            <Text style={styles.screenTitle}>Ngân sách ăn uống</Text>
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Text style={styles.filterIcon}>◴</Text>
          </TouchableOpacity>
        </View>

        {/* Overview Card */}
        <View style={[styles.overviewCard, isLowBudget && styles.overviewCardLow]}>
          <Text style={styles.overviewLabel}>Còn lại trong tháng</Text>
          <Text style={styles.overviewRemaining}>{formatVnd(remaining)}</Text>
          <Text style={styles.overviewDetail}>
            Đã dùng: {formatVnd(spent)} / {formatVnd(budgetData.budgetLimit)}
          </Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${spentPercent}%` }]} />
          </View>
          <Text style={styles.progressBarLabel}>{spentPercent}% ngân sách đã dùng</Text>
        </View>

        {/* Daily Suggestions Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Gợi ý hôm nay</Text>
          <Text style={styles.sectionTitle}>Ăn ngon mà vẫn nhẹ ví</Text>
          <Text style={styles.adviceText}>
            Bạn còn {formatVnd(remaining)} cho {budgetData.daysLeft} ngày.
          </Text>
          <Text style={styles.adviceText}>
            Mỗi ngày nên chi khoảng <Text style={styles.highlightText}>{formatVnd(dailySuggestion)}</Text>.
          </Text>

          <View style={styles.savingMeals}>
            {budgetData.suggestions.map((meal) => (
              <View style={styles.savingMealRow} key={meal.id}>
                <Text style={styles.savingMealName}>🍳 {meal.name}</Text>
                <Text style={styles.savingMealCost}>{meal.costLabel}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/recipes')} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Xem món phù hợp</Text>
          </TouchableOpacity>
        </View>

        {/* Category Spend Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Phân loại</Text>
          <Text style={styles.sectionTitle}>Chi tiêu theo nhóm</Text>

          <View style={styles.categorySpendList}>
            {budgetData.categories.map((category) => {
              const categoryPercent = Math.min(Math.round((category.amount / spent) * 100), 100);
              return (
                <View style={styles.categorySpendRow} key={category.id}>
                  <View style={styles.categoryIconBg}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <View style={styles.categorySpendInfo}>
                    <View style={styles.categoryRowTop}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryAmount}>{formatVnd(category.amount)}</Text>
                    </View>
                    <View style={styles.miniProgressTrack}>
                      <View style={[styles.miniProgressFill, { width: `${categoryPercent}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Expenses Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Gần đây</Text>
          <Text style={styles.sectionTitle}>Chi tiêu gần đây</Text>

          <View style={styles.recentExpenseList}>
            {budgetData.expenses.slice(0, 6).map((expense) => (
              <View style={styles.expenseRow} key={expense.id}>
                <View style={styles.expenseIconBg}>
                  <Text style={styles.expenseIcon}>{expense.icon}</Text>
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{expense.name}</Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
                <Text style={styles.expenseAmount}>-{formatVnd(expense.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reminder Card */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderEmoji}>🔔</Text>
            <Text style={styles.reminderTitle}>Nhắc nhở</Text>
          </View>
          <Text style={styles.reminderText}>
            Tuần này bạn đã đặt đồ ăn 3 lần. CookMate gợi ý dùng nguyên liệu còn sẵn để tiết kiệm hơn.
          </Text>
        </View>

        {/* Float Add Expense Button */}
        <TouchableOpacity style={styles.floatAddButton} onPress={() => setIsSheetOpen(true)} activeOpacity={0.9}>
          <Text style={styles.floatAddButtonText}>+ Thêm chi tiêu</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal visible={isSheetOpen} animationType="slide" transparent>
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.backdropClose} onPress={closeSheet} activeOpacity={1} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleRow}>
              <View>
                <Text style={styles.eyebrow}>Ghi lại chi tiêu</Text>
                <Text style={styles.screenTitle}>Thêm khoản mới</Text>
              </View>
              <TouchableOpacity style={styles.sheetCloseButton} onPress={closeSheet}>
                <Text style={styles.sheetCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên khoản chi</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: Mua rau"
                placeholderTextColor="#999"
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số tiền</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: 25000"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formAmount}
                onChangeText={setFormAmount}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Loại chi tiêu</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                {expenseTypes.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, formCategory === t && styles.typeChipActive]}
                    onPress={() => setFormCategory(t)}
                  >
                    <Text style={[styles.typeChipText, formCategory === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inventoryToggleRow}>
              <Text style={styles.toggleText}>Thêm vào kho nguyên liệu</Text>
              <Switch
                value={formAddToInventory}
                onValueChange={setFormAddToInventory}
                trackColor={{ false: '#caeae0', true: '#14b98f' }}
                thumbColor={formAddToInventory ? '#ffffff' : '#f4faf7'}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={saveExpense} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Lưu</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfffd',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e8f8f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    color: '#11876d',
    fontSize: 20,
    fontWeight: '900',
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  overviewCardLow: {
    backgroundColor: '#ffece5',
    borderColor: '#ffd5c6',
  },
  overviewLabel: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
  },
  overviewRemaining: {
    color: '#102f28',
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 6,
  },
  overviewDetail: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#e8f8f2',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#11876d',
    borderRadius: 4,
  },
  progressBarLabel: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2f5ee',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  sectionEyebrow: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 12,
  },
  adviceText: {
    color: '#16342d',
    fontSize: 14,
    lineHeight: 20,
  },
  highlightText: {
    color: '#11876d',
    fontWeight: '800',
  },
  savingMeals: {
    marginVertical: 14,
    gap: 8,
  },
  savingMealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4faf7',
    padding: 10,
    borderRadius: 12,
  },
  savingMealName: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '700',
  },
  savingMealCost: {
    color: '#11876d',
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#11876d',
    fontSize: 14,
    fontWeight: '800',
  },
  categorySpendList: {
    gap: 16,
  },
  categorySpendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eefbf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    color: '#11876d',
    fontSize: 16,
    fontWeight: '900',
  },
  categorySpendInfo: {
    flex: 1,
  },
  categoryRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryAmount: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '800',
  },
  miniProgressTrack: {
    height: 4,
    backgroundColor: '#f0faf6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#14b98f',
    borderRadius: 2,
  },
  recentExpenseList: {
    gap: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcfefd',
    borderWidth: 1,
    borderColor: '#f0faf6',
    borderRadius: 14,
    padding: 10,
  },
  expenseIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eefbf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  expenseIcon: {
    color: '#11876d',
    fontSize: 14,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '800',
  },
  expenseCategory: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  expenseAmount: {
    color: '#ff7d4d',
    fontSize: 14,
    fontWeight: '800',
  },
  reminderCard: {
    backgroundColor: '#eefbf6',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 80, // spacing for floating button
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reminderEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  reminderTitle: {
    color: '#11876d',
    fontSize: 14,
    fontWeight: '800',
  },
  reminderText: {
    color: '#16342d',
    fontSize: 13,
    lineHeight: 18,
  },
  floatAddButton: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    height: 48,
    backgroundColor: '#11876d',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#11876d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  floatAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  // Modal Sheet styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 52, 45, 0.4)',
    justifyContent: 'flex-end',
  },
  backdropClose: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'stretch',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#caeae0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4faf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCloseText: {
    fontSize: 22,
    color: '#6e8981',
    lineHeight: 22,
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
    backgroundColor: '#fbfffd',
    fontSize: 15,
  },
  typeScroll: {
    height: 48,
    alignItems: 'center',
    gap: 8,
  },
  typeChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
  },
  typeChipActive: {
    backgroundColor: '#e8f8f2',
    borderColor: '#11876d',
  },
  typeChipText: {
    color: '#6e8981',
    fontSize: 13,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: '#11876d',
  },
  inventoryToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4faf7',
    borderWidth: 1,
    borderColor: '#e2f5ee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  toggleText: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#11876d',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
