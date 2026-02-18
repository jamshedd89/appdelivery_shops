import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';
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
    socket.on('connect', () => { socket.emit('order:join', orderId); });
    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.sender_id !== user.id) chatApi.getMessages(orderId).catch(() => {});
    });
    socket.on('chat:typing', ({ userId }) => { if (userId !== user.id) setIsTyping(true); });
    socket.on('chat:stop_typing', ({ userId }) => { if (userId !== user.id) setIsTyping(false); });
  };

  const loadMessages = async () => {
    try {
      const { data } = await chatApi.getMessages(orderId);
      setMessages(data.data);
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await chatApi.sendMessage(orderId, { type: 'text', content: text.trim() });
      setText('');
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось отправить');
    } finally { setSending(false); }
  };

  const handleSendLocation = async () => {
    try {
      const { status } = await require('expo-location').requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Ошибка', 'Нет доступа к геолокации');
      const loc = await require('expo-location').getCurrentPositionAsync({});
      await chatApi.sendMessage(orderId, {
        type: 'location',
        content: `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`,
        latitude: loc.coords.latitude, longitude: loc.coords.longitude,
      });
    } catch { Alert.alert('Ошибка', 'Не удалось отправить геолокацию'); }
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
        {!isMine && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>{(otherUser?.first_name || '?')[0]}</Text>
          </View>
        )}
        <View style={{ maxWidth: '75%' }}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
            {!isMine && (
              <Text style={styles.senderName}>
                {otherUser?.first_name || 'Собеседник'} ({otherUser?.role === 'courier' ? 'Курьер' : 'Продавец'})
              </Text>
            )}
            {item.type === 'location' ? (
              <View style={styles.locationMsg}>
                <Ionicons name="location" size={16} color={isMine ? COLORS.dark : COLORS.primary} />
                <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.content}</Text>
              </View>
            ) : (
              <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.content}</Text>
            )}
          </View>
          <View style={[styles.msgMeta, isMine && { alignSelf: 'flex-end' }]}>
            <Text style={styles.msgTime}>{formatTime(item.createdAt || item.created_at)}</Text>
            {isMine && (
              <Ionicons name={item.is_read ? 'checkmark-done' : 'checkmark'} size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
      </View>
    );
  }, [user.id]);

  const otherName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Чат';
  const otherRole = otherUser?.role === 'courier' ? 'Курьер' : 'Продавец';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{otherName[0]?.toUpperCase()}</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{otherName} ({otherRole})</Text>
            <View style={styles.headerRating}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.headerRatingText}>{otherUser?.rating?.toFixed(1) || '5.0'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="call" size={20} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
        {/* Order chip */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Ionicons name="cube" size={14} color={COLORS.text} />
            <Text style={styles.chipText}>ЗАКАЗ #{orderId}</Text>
          </View>
          {isTyping && (
            <View style={[styles.chip, { backgroundColor: COLORS.background }]}>
              <Ionicons name="ellipsis-horizontal" size={14} color={COLORS.textSecondary} />
              <Text style={[styles.chipText, { color: COLORS.textSecondary }]}>ПЕЧАТАЕТ...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            ListHeaderComponent={
              <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>СЕГОДНЯ</Text></View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>Начните общение</Text>
                <Text style={styles.emptySubtext}>Напишите сообщение или отправьте геолокацию</Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity onPress={handleSendLocation} style={styles.addBtn}>
            <Ionicons name="add" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Введите сообщение..."
            placeholderTextColor={COLORS.textSecondary}
            multiline maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.dark} />
            ) : (
              <Ionicons name="send" size={18} color={COLORS.dark} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  header: {
    backgroundColor: COLORS.white, borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryGhost,
  },
  headerMain: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 10, gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primaryGhost, borderWidth: 2,
    borderColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  headerAvatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.white,
  },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  headerRatingText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  callBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 3,
  },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primaryGhost, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 9999,
  },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: COLORS.text },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },

  dayBadge: {
    alignSelf: 'center', backgroundColor: COLORS.background,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, marginBottom: 16,
  },
  dayBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  msgRowRight: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  msgAvatarText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  bubble: { padding: 12, borderRadius: 18 },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.cardAlt, borderBottomLeftRadius: 4 },
  senderName: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4, opacity: 0.7 },
  msgText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  msgTextMine: { color: COLORS.dark },
  locationMsg: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 4 },
  msgTime: { fontSize: 10, color: COLORS.textSecondary },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.primaryGhost,
    gap: 8,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100,
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: COLORS.background, borderRadius: 22,
    fontSize: 15, color: COLORS.text,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 3,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
