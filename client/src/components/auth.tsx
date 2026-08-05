import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { authService } from '../services/auth.service';
import tokenStorage from '../services/tokenStorage';

interface AuthScreenProps {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    try {
      if (email.trim() && password) {
        await authService.login(email.trim(), password);
      } else {
        await tokenStorage.setAccessToken('demo_access_token');
        await tokenStorage.setRefreshToken('demo_refresh_token');
      }
      onLogin();
    } catch (err) {
      console.warn('Backend login failed, using guest mode:', err);
      await tokenStorage.setAccessToken('demo_access_token');
      await tokenStorage.setRefreshToken('demo_refresh_token');
      onLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandMarkContainer}>
            <Text style={styles.brandMark}>CM</Text>
          </View>
          <Text style={styles.eyebrow}>CookMate AI</Text>
          <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Vào căn bếp ảo và nhận gợi ý món ăn từ nguyên liệu đang có.'
              : 'Tạo tài khoản để lưu kho nguyên liệu và món ăn yêu thích.'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Minh Anh"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ban@cookmate.vn"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? ' Đăng ký ngay' : ' Đăng nhập ngay'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfffd',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandMarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#14b98f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14b98f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 16,
  },
  brandMark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  eyebrow: {
    color: '#6e8981',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: '#102f28',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6e8981',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#16342d',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#16342d',
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  button: {
    height: 48,
    backgroundColor: '#11876d',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#11876d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6e8981',
    fontSize: 14,
  },
  switchText: {
    color: '#11876d',
    fontSize: 14,
    fontWeight: '800',
  },
});
