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
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface ChatMessage {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

const ChatScreen = ({ navigation }: { navigation: any }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChatHistory();
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
          timestamp: log.timestamp
        }));
        setMessages(chatMessages.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Fallback to initial message
      setMessages([{
        id: '1',
        query: '',
        response: 'Hello! I\'m here to help you. How can I assist you today?',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = message;
    setMessage('');

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post('http://10.0.2.2:5000/api/mobile/chat', {
        query: userMessage
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          query: userMessage,
          response: response.data.data.response,
          timestamp: response.data.data.timestamp
        };
        setMessages(prev => [...prev, newMessage]);
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Support Chat</Text>
      </View>

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
            <View style={[styles.messageBubble, styles.supportMessage]}>
              <Text style={[styles.messageText, styles.supportMessageText]}>
                {msg.response}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(msg.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
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
  supportMessage: {
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
  supportMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
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