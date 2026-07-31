import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const todayStats = [
    { id: 'ingredients', value: '05', label: 'Trong kho', route: '/inventory' },
    { id: 'recipes', value: '08', label: 'Món gợi ý', route: '/recipes' },
    { id: 'budget', value: '680K', label: 'Còn lại', route: '/budget' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeUser}>Xin chào, Duy Anh 👋</Text>
            <Text style={styles.welcomeTitle}>Hôm nay mình giúp bạn nấu món gì?</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <View style={styles.bellDot} />
            <Text style={styles.bellIcon}>♡</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/home.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.eyebrow}>CookMate AI</Text>
          <Text style={styles.introTitle}>Căn bếp xanh của bạn</Text>
          <Text style={styles.introText}>
            Nấu gọn, ăn ngon và tận dụng nguyên liệu đang có trong kho.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/recipes')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>✨ Gợi ý món ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Expiry Alert Card */}
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => router.push('/recipes')}
          activeOpacity={0.9}
        >
          <View style={styles.alertIconBg}>
            <Text style={styles.alertIcon}>!</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Rau muống còn 1 ngày</Text>
            <Text style={styles.alertSubtitle}>Dùng hôm nay để tránh lãng phí nhé.</Text>
          </View>
          <Text style={styles.alertChevron}>›</Text>
        </TouchableOpacity>

        {/* Overview Section */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Tổng quan hôm nay</Text>
          <View style={styles.overviewGrid}>
            {todayStats.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.overviewCard}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.overviewValue}>{item.value}</Text>
                <Text style={styles.overviewLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
    paddingRight: 16,
  },
  welcomeUser: {
    color: '#0f8d6d',
    fontSize: 14,
    fontWeight: '800',
  },
  welcomeTitle: {
    color: '#102f28',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    marginTop: 4,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e8f8f2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff7d4d',
    borderWidth: 1.5,
    borderColor: '#e8f8f2',
  },
  bellIcon: {
    color: '#11876d',
    fontSize: 20,
    fontWeight: '900',
  },
  heroContainer: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d9f1ea',
    backgroundColor: '#effcf7',
    marginBottom: 20,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  introCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  eyebrow: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  introTitle: {
    color: '#102f28',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  introText: {
    color: '#6e8981',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#11876d',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#11876d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffece5',
    borderWidth: 1,
    borderColor: '#ffd5c6',
    borderRadius: 18,
    padding: 14,
    marginBottom: 24,
  },
  alertIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff7d4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#b23b10',
    fontSize: 14,
    fontWeight: '800',
  },
  alertSubtitle: {
    color: '#ff7d4d',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  alertChevron: {
    color: '#ff7d4d',
    fontSize: 24,
    fontWeight: '400',
    marginLeft: 8,
  },
  overviewSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  overviewValue: {
    color: '#11876d',
    fontSize: 22,
    fontWeight: '900',
  },
  overviewLabel: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
