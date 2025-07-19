import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatMessage = ({ message, isOwnMessage }) => {
  // Ensure message is an object and has text
  if (!message || typeof message !== 'object') {
    console.error('Invalid message passed to ChatMessage:', message);
    return null;
  }

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Safely extract text - convert to string if it's not already
  const messageText = String(message?.text || 'No message content');
  const timestamp = message?.timestamp || new Date().toISOString();
  const isEncrypted = Boolean(message?.encrypted);

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownText : styles.otherText
        ]}>
          {messageText}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(timestamp)}
          </Text>
          {isEncrypted && (
            <Text style={styles.encryptionIcon}>🔒</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 10,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  ownBubble: {
    backgroundColor: '#0084FF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  encryptionIcon: {
    fontSize: 10,
    marginLeft: 4,
  },
});

export default ChatMessage;
