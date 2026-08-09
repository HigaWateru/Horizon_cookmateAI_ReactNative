import React from 'react';
import ChatScreen from '@/components/chat';
import { router } from 'expo-router';

export default function ChatRoute() {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  };

  return <ChatScreen onBack={handleBack} />;
}
