import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, FONTS, SHADOWS } from '../../utils/constants';
import { SOCKET_URL } from '../../utils/constants';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

export default function ChatScreen({ route, navigation }) {
  const { orderId, otherUser } = route.params;
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    loadMessages();
    connectSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('order:leave', orderId);
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectSocket = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    const socket = io(`${SOCKET_URL}/orders`, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('order:join', orderId);
    });
    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.sender_id !== user.id) {
        chatApi.getMessages(orderId).catch(() => {});
      }
    });
    socket.on('chat:typing', ({ userId }) => {
      if (userId !== user.id) setIsTyping(true);
    });
    socket.on('chat:stop_typing', ({ userId }) => {
      if (userId !== user.id) setIsTyping(false);
    });
  };

  const loadMessages = async () => {
    try {
      const { data } = await chatApi.getMessages(orderId);
      setMessages(data.data);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await chatApi.sendMessage(orderId, { type: 'text', content: text.trim() });
      setText('');
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось отправить');
    } finally {
      setSending(false);
    }
  };

  const handleSendLocation = async () => {
    try {
      const { status } = await require('expo-location').requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Ошибка', 'Нет доступа к геолокации');
      const loc = await require('expo-location').getCurrentPositionAsync({});
      await chatApi.sendMessage(orderId, {
        type: 'location',
        content: `📍 ${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось отправить геолокацию');
    }
  };

  const handleTextChange = (val) => {
    setText(val);
    if (socketRef.current) {
      socketRef.current.emit('chat:typing', { orderId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socketRef.current?.emit('chat:stop_typing', { orderId });
      }, 2000);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = useCallback(({ item }) => {
    const isMine = item.sender_id === user.id;
    return (
      <View style={[styles.msgRow, isMine && styles.msgRowRight]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          {item.type === 'location' ? (
            <View style={styles.locationMsg}>
              <Ionicons name="location" size={18} color={isMine ? '#fff' : COLORS.primary} />
              <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.content}</Text>
            </View>
          ) : (
            <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.content}</Text>
          )}
          <View style={styles.msgMeta}>
            <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>{formatTime(item.createdAt || item.created_at)}</Text>
            {isMine && (
              <Ionicons
                name={item.is_read ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={isMine ? 'rgba(255,255,255,0.7)' : COLORS.textMuted}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [user.id]);

  const otherName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Чат';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{otherName[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherName}</Text>
            {isTyping && <Text style={styles.typingText}>печатает...</Text>}
          </View>
        </View>
        <Text style={styles.orderLabel}>#{orderId}</Text>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={COLORS.border} />
                <Text style={styles.emptyText}>Начните общение</Text>
                <Text style={styles.emptySubtext}>Напишите сообщение или отправьте геолокацию</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TouchableOpacity onPress={handleSendLocation} style={styles.attachBtn}>
            <Ionicons name="location-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Сообщение..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14,
  },
  backBtn: { padding: 6 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  typingText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' },
  orderLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { paddingHorizontal: 12, paddingVertical: 10, flexGrow: 1 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { ...FONTS.h3, color: COLORS.textSecondary, marginTop: 12 },
  emptySubtext: { ...FONTS.caption, marginTop: 4 },

  msgRow: { marginBottom: 6, flexDirection: 'row' },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%', padding: 10, borderRadius: 16, ...SHADOWS.small,
  },
  bubbleMine: {
    backgroundColor: COLORS.primary, borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
  },
  msgText: { ...FONTS.body, color: COLORS.text },
  msgTextMine: { color: '#fff' },
  locationMsg: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  msgTime: { fontSize: 11, color: COLORS.textMuted },
  msgTimeMine: { color: 'rgba(255,255,255,0.6)' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 8,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  attachBtn: { padding: 8 },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F0F2F5', borderRadius: 20, ...FONTS.body, marginHorizontal: 6,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
