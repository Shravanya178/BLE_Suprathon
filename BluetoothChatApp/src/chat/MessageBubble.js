import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ message }) => (
  <View style={[styles.bubble, message.sent ? styles.sent : styles.received]}>
    <Text>{message.text}</Text>
  </View>
);

const styles = StyleSheet.create({
  bubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
  sent: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  received: { backgroundColor: '#FFF', alignSelf: 'flex-start' },
});

export default MessageBubble;
