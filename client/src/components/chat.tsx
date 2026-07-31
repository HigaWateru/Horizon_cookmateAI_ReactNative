import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ChatScreenProps {
  onBack?: () => void;
}

export default function ChatScreen({ onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Tôi có trứng, rau muống và thịt thì nấu gì?',
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Bạn có thể nấu thịt xào rau muống. Mất khoảng 20 phút và không cần mua thêm.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!draft.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: draft,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = draft;
    setDraft('');

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate AI response
    setTimeout(() => {
      let aiText = 'Chào bạn! Đây là chế độ demo của CookMate AI. Hệ thống đang ghi nhận thông tin nấu ăn của bạn.';
      if (userText.toLowerCase().includes('hết hạn') || userText.toLowerCase().includes('ngày')) {
        aiText = 'Tôi khuyên bạn nên sử dụng rau muống (còn 1 ngày) để làm món "Thịt xào rau muống" hoặc "Rau muống xào tỏi" để tránh lãng phí!';
      } else if (userText.toLowerCase().includes('rẻ') || userText.toLowerCase().includes('tiết kiệm')) {
        aiText = 'Để tiết kiệm chi phí, món "Trứng chiên cà chua" là lựa chọn tốt nhất hiện tại (chi phí mua thêm: 0đ).';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  };

  const selectQuickPrompt = (prompt: string) => {
    setDraft(prompt);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>AI</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.eyebrow}>Trợ lý nấu ăn</Text>
            <Text style={styles.title}>Chat với CookMate</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.chatPanel}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.quickPrompts}>
          <TouchableOpacity
            style={styles.quickPromptButton}
            onPress={() => selectQuickPrompt('Dùng đồ sắp hết hạn')}
          >
            <Text style={styles.quickPromptText}>Dùng đồ sắp hết hạn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPromptButton}
            onPress={() => selectQuickPrompt('Món rẻ')}
          >
            <Text style={styles.quickPromptText}>Món rẻ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhắn CookMate..."
            placeholderTextColor="#999"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!draft.trim()}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfffd',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f8f2',
    backgroundColor: '#ffffff',
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 32,
    color: '#11876d',
    lineHeight: 32,
  },
  headerTitleContainer: {
    flex: 1,
  },
  eyebrow: {
    color: '#6e8981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#102f28',
    fontSize: 18,
    fontWeight: '900',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eefbf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14b98f',
    marginRight: 6,
  },
  statusText: {
    color: '#11876d',
    fontSize: 11,
    fontWeight: '700',
  },
  chatPanel: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#14b98f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  botAvatarText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#11876d',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#eefaf5',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2f5ee',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#16342d',
  },
  quickPrompts: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  quickPromptButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  quickPromptText: {
    color: '#11876d',
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#caeae0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#caeae0',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#16342d',
    backgroundColor: '#fbfffd',
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#11876d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#caeae0',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});
