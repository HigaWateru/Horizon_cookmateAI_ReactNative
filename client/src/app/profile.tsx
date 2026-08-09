import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '../services/auth.service';
import tokenStorage from '../services/tokenStorage';
import ChatScreen from '../components/chat';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

  const fetchProfile = async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token || token === 'demo_access_token') {
      setUser({
        name: 'Duy Anh',
        email: 'ban@cookmate.vn',
      });
      return;
    }

    try {
      const response = await authService.getMe();
      if (response && response.result) {
        setUser(response.result);
      }
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const profileName = user ? user.name : 'Duy Anh';
  const profileEmail = user ? user.email : 'ban@cookmate.vn';
  const avatarText = user && user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'DA';

  if (showChat) {
    return <ChatScreen onBack={() => setShowChat(false)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Tài khoản CookMate</Text>
          <Text style={styles.screenTitle}>Cá nhân</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarText}</Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileDesc}>
                Email: {profileEmail}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => setShowChat(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.chatButtonText}>💬 Chat AI</Text>
          </TouchableOpacity>
        </View>

        {/* Cooking Habits Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thói quen nấu ăn</Text>
          <View style={styles.preferenceList}>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Khẩu vị</Text>
              <Text style={styles.preferenceValue}>Đậm đà, ít cay</Text>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Mục tiêu</Text>
              <Text style={styles.preferenceValue}>Tiết kiệm chi phí</Text>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Thời gian rảnh</Text>
              <Text style={styles.preferenceValue}>15 - 25 phút/bữa</Text>
            </View>
          </View>
        </View>

        {/* Actions Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.navigate('/inventory')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTitle}>Kho nguyên liệu</Text>
            <Text style={styles.actionSubtitle}>Xem đồ đang có</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.navigate('/budget')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionTitle}>Ngân sách</Text>
            <Text style={styles.actionSubtitle}>Theo dõi chi tiêu</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Button */}
        <TouchableOpacity
          style={styles.fullWidthActionButton}
          onPress={() => router.navigate('/statistics')}
          activeOpacity={0.8}
        >
          <Text style={styles.fullWidthActionTitle}>📊 Báo cáo & Thống kê</Text>
          <Text style={styles.fullWidthActionSubtitle}>Phân tích kho đồ ăn & xu hướng chi tiêu</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>🚪 Đăng xuất</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
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
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#14b98f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
  },
  profileDesc: {
    color: '#6e8981',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  chatButton: {
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
  chatButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
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
  sectionTitle: {
    color: '#102f28',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 16,
  },
  preferenceList: {
    gap: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0faf6',
    paddingBottom: 10,
  },
  preferenceLabel: {
    color: '#6e8981',
    fontSize: 14,
    fontWeight: '700',
  },
  preferenceValue: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '800',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  actionTitle: {
    color: '#11876d',
    fontSize: 15,
    fontWeight: '900',
  },
  actionSubtitle: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  fullWidthActionButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    shadowColor: '#12604d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  fullWidthActionTitle: {
    color: '#11876d',
    fontSize: 15,
    fontWeight: '900',
  },
  fullWidthActionSubtitle: {
    color: '#6e8981',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffccd3',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#a81c30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  logoutButtonText: {
    color: '#d9384d',
    fontSize: 15,
    fontWeight: '800',
  },
});
