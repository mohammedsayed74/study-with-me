import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme/theme';
import { getDocumentDetails, sendChatMessage } from '../../src/services/aiService';
import Flashcard from '../../src/components/Flashcard';

export default function AiDocumentView() {
  const { documentId } = useLocalSearchParams();
  const router = useRouter();

  const [document, setDocument] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, flashcards, chat
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchDocumentDetails();
  }, [documentId]);

  const fetchDocumentDetails = async () => {
    try {
      const data = await getDocumentDetails(documentId);
      setDocument(data.document);
      setChatHistory(data.chatHistory || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to fetch document");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', text: message };
    setChatHistory([...chatHistory, userMessage]);
    setMessage('');
    setChatLoading(true);

    try {
      const data = await sendChatMessage(documentId, userMessage.text);
      setChatHistory(prev => [...prev, data]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.navy2} />
        <Text style={styles.loadingText}>Loading document insights...</Text>
      </View>
    );
  }

  if (!document) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Document not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.navy2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{document.title}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'roadmap' && styles.activeTab]} 
          onPress={() => setActiveTab('roadmap')}
        >
          <Text style={[styles.tabText, activeTab === 'roadmap' && styles.activeTabText]}>Roadmap</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]} 
          onPress={() => setActiveTab('flashcards')}
        >
          <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>Flashcards</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]} 
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>AI Chat</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'roadmap' && (
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollPadding}>
          <Text style={styles.sectionTitle}>Generated Study Roadmap</Text>
          {document.roadmap?.map((item, index) => (
            <View key={index} style={styles.roadmapItem}>
              <View style={styles.roadmapBullet} />
              <View style={styles.roadmapContent}>
                <Text style={styles.roadmapTopic}>{item.topic}</Text>
                <Text style={styles.roadmapDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === 'flashcards' && (
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollPadding}>
          <Text style={styles.sectionTitle}>Test Your Knowledge</Text>
          {document.flashcards?.map((card, index) => (
            <Flashcard key={index} question={card.question} answer={card.answer} />
          ))}
        </ScrollView>
      )}

      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatMessages} 
            contentContainerStyle={styles.chatPadding}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {chatHistory.map((msg, index) => (
              <View key={index} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageModel]}>
                <View style={[styles.msgBubble, msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleModel]}>
                  <Text style={[styles.msgText, msg.role === 'user' ? styles.msgTextUser : styles.msgTextModel]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}
            {chatLoading && (
              <View style={[styles.messageWrapper, styles.messageModel]}>
                <View style={[styles.msgBubble, styles.msgBubbleModel]}>
                  <ActivityIndicator size="small" color={COLORS.navy2} />
                  <Text style={[styles.msgText, styles.msgTextModel, {marginLeft: 8}]}>AI is typing...</Text>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Ask about this document..."
              placeholderTextColor={COLORS.gray}
              editable={!chatLoading}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!message.trim() || chatLoading) && styles.sendButtonDisabled]} 
              onPress={handleSendMessage}
              disabled={!message.trim() || chatLoading}
            >
              <Ionicons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.red,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: COLORS.navy2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButtonIcon: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.navy2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.navy2,
  },
  contentContainer: {
    flex: 1,
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy2,
    marginBottom: 16,
  },
  roadmapItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roadmapBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.teal,
    marginTop: 6,
    marginRight: 12,
  },
  roadmapContent: {
    flex: 1,
  },
  roadmapTopic: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  roadmapDesc: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
  },
  chatPadding: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  messageUser: {
    justifyContent: 'flex-end',
  },
  messageModel: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgBubbleUser: {
    backgroundColor: COLORS.navy2,
    borderBottomRightRadius: 4,
  },
  msgBubbleModel: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  msgTextUser: {
    color: COLORS.white,
  },
  msgTextModel: {
    color: COLORS.navy,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.navy,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.navy2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
});
