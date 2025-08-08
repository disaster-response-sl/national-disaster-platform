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
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Pre-defined quick questions for AI Safety Assistant
  const quickQuestions: QuickQuestion[] = [
    { id: '1', text: 'What should I do in an earthquake?', category: 'emergency' },
    { id: '2', text: 'How to prepare for a hurricane?', category: 'safety' },
    { id: '3', text: 'What emergency supplies do I need?', category: 'information' },
    { id: '4', text: 'How to stay safe during a flood?', category: 'safety' },
    { id: '5', text: 'What are evacuation procedures?', category: 'emergency' },
    { id: '6', text: 'How to help others in crisis?', category: 'support' },
    { id: '7', text: 'What are the warning signs of danger?', category: 'safety' },
    { id: '8', text: 'How to communicate during emergencies?', category: 'information' },
  ];

  useEffect(() => {
    fetchChatHistory();
    // Initialize with AI Safety Assistant welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        query: '',
        response: 'Hello! I\'m your AI Safety Assistant. I\'m here to help you with emergency preparedness, safety guidelines, and crisis response. I can provide real-time safety recommendations and emergency guidance. How can I assist you today?',
        timestamp: new Date().toISOString(),
        type: 'assistant',
        safetyLevel: 'low',
        recommendations: ['Use quick questions below for common scenarios', 'Ask about specific emergency situations', 'Request safety checklists and procedures']
      }]);
    }
  }, []);

  const fetchChatHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://10.0.2.2:5000/api/mobile/chat-logs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Transform chat logs to message format
        const chatMessages = response.data.data.map((log: any) => ({
          id: log._id,
          query: log.query,
          response: log.response,
          timestamp: log.timestamp,
          type: log.type || 'assistant',
          safetyLevel: log.safetyLevel,
          recommendations: log.recommendations
        }));
        setMessages(chatMessages.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const processMessageWithGemini = async (userMessage: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post('http://10.0.2.2:5000/api/mobile/chat/gemini', {
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

    // Add user message immediately
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
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = async (question: QuickQuestion) => {
    setLoading(true);
    setIsTyping(true);
    setMessage('');

    // Add user message immediately
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
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const getSafetyLevelColor = (level?: string) => {
    switch (level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00aa00';
      default: return '#666666';
    }
  };

  const getSafetyLevelText = (level?: string) => {
    switch (level) {
      case 'high': return '⚠️ High Risk';
      case 'medium': return '⚠️ Medium Risk';
      case 'low': return '✅ Low Risk';
      default: return '';
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
      <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickQuestions.map((question) => (
          <TouchableOpacity
            key={question.id}
            style={[styles.quickQuestionButton, styles[`${question.category}Category`]]}
            onPress={() => handleQuickQuestion(question)}
            disabled={loading}
          >
            <Text style={styles.quickQuestionText}>{question.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Safety Assistant</Text>
        <Text style={styles.subtitle}>Emergency Support & Safety Guidance</Text>
      </View>

      {renderQuickQuestions()}

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View key={msg.id}>
            {msg.query && (
              <View style={[styles.messageBubble, styles.userMessage]}>
                <Text style={[styles.messageText, styles.userMessageText]}>
                  {msg.query}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            )}
            {msg.response && (
              <View style={[styles.messageBubble, styles.assistantMessage]}>
                {msg.safetyLevel && (
                  <View style={[styles.safetyIndicator, { backgroundColor: getSafetyLevelColor(msg.safetyLevel) }]}>
                    <Text style={styles.safetyLevelText}>
                      {getSafetyLevelText(msg.safetyLevel)}
                    </Text>
                  </View>
                )}
                <Text style={[styles.messageText, styles.assistantMessageText]}>
                  {msg.response}
                </Text>
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <View style={styles.recommendationsContainer}>
                    <Text style={styles.recommendationsTitle}>💡 Recommendations:</Text>
                    {msg.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.recommendationText}>
                        • {rec}
                      </Text>
                    ))}
                  </View>
                )}
                <Text style={styles.timestamp}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            )}
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageBubble, styles.assistantMessage]}>
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#007bff" />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about safety, emergencies, or get help..."
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickQuestionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  quickQuestionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 120,
  },
  emergencyCategory: {
    backgroundColor: '#ff4444',
  },
  safetyCategory: {
    backgroundColor: '#ffaa00',
  },
  informationCategory: {
    backgroundColor: '#007bff',
  },
  supportCategory: {
    backgroundColor: '#00aa00',
  },
  quickQuestionText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#333',
  },
  safetyIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  safetyLevelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
});

export default ChatScreen; 