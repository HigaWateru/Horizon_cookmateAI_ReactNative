import React from 'react';
import ChatScreen from '@/components/chat';
import { router } from 'expo-router';

export default function ChatRoute() {
  return <ChatScreen onBack={() => router.back()} />;
}
