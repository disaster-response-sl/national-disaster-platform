// components/ChatScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLanguage } from '../services/LanguageService';
import { API_BASE_URL } from '../config/api';
import { getTextStyle } from '../services/FontService';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'system';
  safetyLevel?: 'low' | 'medium' | 'high';
  recommendations?: string[];
}

interface QuickQuestion {
  id: string;
  text: string;
  category: 'emergency' | 'safety' | 'information' | 'support';
}

const ChatScreen = ({ navigation }: { navigation: any }) => {
  const { t, language } = useLanguage();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [inputFocused, setInputFocused] = useState(false);

  // Pre-defined quick questions for AI Safety Assistant
  const quickQuestions: QuickQuestion[] = [
    { id: '1', text: t('chat.quickQuestionsList.earthquake'), category: 'emergency' },
    { id: '2', text: t('chat.quickQuestionsList.hurricane'), category: 'safety' },
    { id: '3', text: t('chat.quickQuestionsList.supplies'), category: 'information' },
    { id: '4', text: t('chat.quickQuestionsList.flood'), category: 'emergency' },
    { id: '5', text: t('chat.quickQuestionsList.evacuation'), category: 'safety' },
    { id: '6', text: t('chat.quickQuestionsList.helpOthers'), category: 'support' },
    { id: '7', text: t('chat.quickQuestionsList.warningSigns'), category: 'information' },
    { id: '8', text: t('chat.quickQuestionsList.communication'), category: 'emergency' },
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    fetchChatHistory();
    // Initialize with AI Safety Assistant welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        query: '',
        response: t('chat.welcomeMessage'),
        timestamp: new Date().toISOString(),
        type: 'assistant',
        safetyLevel: 'low',
        recommendations: [t('chat.recommendations')]
      }]);
    }
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
  const response = await axios.get(`${API_BASE_URL}/mobile/chat-logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const chatMessages = response.data.data.map((log: any) => ({
          id: log._id,
          query: log.query,
          response: log.response,
          timestamp: log.timestamp,
          type: log.type || 'assistant',
          safetyLevel: log.safetyLevel,
          recommendations: log.recommendations
        }));
        setMessages(chatMessages.reverse());
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const processMessageWithGemini = async (userMessage: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
  const response = await axios.post(`${API_BASE_URL}/mobile/chat/gemini`, {
        query: userMessage,
        context: 'AI Safety Assistant for emergency preparedness and crisis response'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setIsTyping(true);
    const userMessage = message;
    setMessage('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      query: userMessage,
      response: '',
      timestamp: new Date().toISOString(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await processMessageWithGemini(userMessage);

      if (result.success) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          query: '',
          response: result.data.response,
          timestamp: result.data.timestamp,
          type: 'assistant',
          safetyLevel: result.data.safetyLevel,
          recommendations: result.data.recommendations
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Connection Error', 'Unable to get AI response. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = async (question: QuickQuestion) => {
    setLoading(true);
    setIsTyping(true);
    setMessage('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      query: question.text,
      response: '',
      timestamp: new Date().toISOString(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await processMessageWithGemini(question.text);

      if (result.success) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          query: '',
          response: result.data.response,
          timestamp: result.data.timestamp,
          type: 'assistant',
          safetyLevel: result.data.safetyLevel,
          recommendations: result.data.recommendations
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Error processing quick question:', error);
      Alert.alert('Connection Error', 'Unable to get AI response. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const getSafetyLevelColor = (level?: string) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSafetyLevelText = (level?: string) => {
    switch (level) {
      case 'high': return '🔴 High Risk';
      case 'medium': return '🟡 Medium Risk';
      case 'low': return '🟢 Low Risk';
      default: return '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'safety': return '🛡️';
      case 'information': return 'ℹ️';
      case 'support': return '🤝';
      default: return '❓';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return '#ef4444';
      case 'safety': return '#f59e0b';
      case 'information': return '#3b82f6';
      case 'support': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQuickQuestions = () => (
    <View style={styles.quickQuestionsContainer}>
      <View style={styles.quickQuestionsHeader}>
        <Text style={[styles.quickQuestionsTitle, getTextStyle(language)]}>
          {t('chat.quickQuestions')}
        </Text>
        <Text style={[styles.quickQuestionsSubtitle, getTextStyle(language)]}>
          {t('chat.quickQuestionsSubtitle')}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickQuestionsScroll}
      >
        {quickQuestions.map((question) => (
          <TouchableOpacity
            key={question.id}
            style={[styles.quickQuestionButton, { backgroundColor: getCategoryColor(question.category) }]}
            onPress={() => handleQuickQuestion(question)}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.quickQuestionIcon}>{getCategoryIcon(question.category)}</Text>
            <Text style={[styles.quickQuestionText, getTextStyle(language)]}>
              {question.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* AI Assistant Header */}
          <View style={styles.header}>
            <View style={styles.aiIndicator}>
              <View style={styles.aiIconContainer}>
                <Text style={styles.aiIcon}>🤖</Text>
              </View>
              <View style={styles.aiInfo}>
                <Text style={[styles.aiTitle, getTextStyle(language)]}>
                  {t('chat.title')}
                </Text>
                <View style={styles.statusContainer}>
                  <View style={styles.onlineIndicator} />
                  <Text style={[styles.statusText, getTextStyle(language)]}>
                    {t('chat.online')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {renderQuickQuestions()}

          <ScrollView
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={styles.messageContainer}>
                {msg.query && (
                  <View style={[styles.messageBubble, styles.userMessage]}>
                    <Text style={styles.userMessageText}>
                      {msg.query}
                    </Text>
                    <Text style={styles.userTimestamp}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                )}
                {msg.response && (
                  <View style={[styles.messageBubble, styles.assistantMessage]}>
                    <View style={styles.assistantHeader}>
                      <View style={styles.assistantAvatar}>
                        <Text style={styles.assistantAvatarText}>🤖</Text>
                      </View>
                      <View style={styles.assistantInfo}>
                        <Text style={[styles.assistantName, getTextStyle(language)]}>
                          {t('chat.aiName')}
                        </Text>
                        {msg.safetyLevel && (
                          <View style={[styles.safetyBadge, { backgroundColor: getSafetyLevelColor(msg.safetyLevel) }]}>
                            <Text style={styles.safetyLevelText}>
                              {getSafetyLevelText(msg.safetyLevel)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={styles.assistantMessageText}>
                      {msg.response}
                    </Text>

                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <View style={styles.recommendationsContainer}>
                        <Text style={styles.recommendationsTitle}>💡 Key Recommendations</Text>
                        <View style={styles.recommendationsList}>
                          {msg.recommendations.map((rec, index) => (
                            <View key={index} style={styles.recommendationItem}>
                              <Text style={styles.recommendationBullet}>•</Text>
                              <Text style={styles.recommendationText}>{rec}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    <Text style={styles.assistantTimestamp}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageBubble, styles.assistantMessage]}>
                <View style={styles.assistantHeader}>
                  <View style={styles.assistantAvatar}>
                    <Text style={styles.assistantAvatarText}>🤖</Text>
                  </View>
                  <Text style={[styles.assistantName, getTextStyle(language)]}>
                    {t('chat.aiName')}
                  </Text>
                </View>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={[styles.typingText, getTextStyle(language)]}>
                    {t('common.loading')}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Enhanced Input Section */}
          <View style={styles.inputSection}>
            <View style={[styles.inputContainer, inputFocused && styles.inputContainerFocused]}>
              <TextInput
                style={[styles.input, getTextStyle(language)]}
                placeholder={t('chat.typeMessage')}
                placeholderTextColor="#94a3b8"
                value={message}
                onChangeText={setMessage}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                multiline
                maxLength={500}
                editable={!loading}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!message.trim() || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? '⏳' : '📤'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHelper}>
              {t('chat.inputHelper')}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1f2937',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiIcon: {
    fontSize: 24,
  },
  aiInfo: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  quickQuestionsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  quickQuestionsHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  quickQuestionsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickQuestionsScroll: {
    paddingHorizontal: 16,
  },
  quickQuestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickQuestionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickQuestionText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessageText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 6,
  },
  userTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'flex-end',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  assistantAvatarText: {
    fontSize: 16,
  },
  assistantInfo: {
    flex: 1,
  },
  assistantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  safetyLevelText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  assistantMessageText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  recommendationsList: {
    gap: 6,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    flex: 1,
  },
  assistantTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  inputContainerFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 80,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0.1,
  },
  inputHelper: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatScreen;
