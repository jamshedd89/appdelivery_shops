import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reviewsApi } from '../services/api';
import { COLORS } from '../utils/constants';

export default function ReviewModal({ visible, onClose, orderId, targetUser, onSuccess }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!orderId || !targetUser?.id) return;
    setLoading(true);
    try {
      await reviewsApi.create(orderId, { target_id: targetUser.id, stars, comment: comment.trim() || undefined });
      Alert.alert('Спасибо!', 'Ваш отзыв сохранён.');
      onSuccess?.();
      onClose();
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось оставить отзыв');
    } finally { setLoading(false); }
  };

  const targetName = targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : '';
  const targetRole = targetUser?.role === 'courier' ? 'курьера' : 'продавца';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(targetUser?.first_name || '?')[0]}</Text>
            </View>
          </View>

          <Text style={styles.title}>Оцените {targetRole}</Text>
          <Text style={styles.subtitle}>{targetName}</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStars(s)} activeOpacity={0.7}>
                <Ionicons
                  name={s <= stars ? 'star' : 'star-outline'}
                  size={40}
                  color={s <= stars ? '#f59e0b' : COLORS.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.starsLabel}>
            {stars === 1 ? 'Плохо' : stars === 2 ? 'Ниже среднего' : stars === 3 ? 'Нормально' : stars === 4 ? 'Хорошо' : 'Отлично!'}
          </Text>

          {/* Comment */}
          <TextInput
            style={styles.commentInput}
            placeholder="Комментарий (необязательно)"
            placeholderTextColor={COLORS.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.dark} />
            ) : (
              <Text style={styles.submitText}>Отправить отзыв</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16, width: 36, height: 36,
    borderRadius: 18, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', zIndex: 1,
  },
  avatarWrap: { marginTop: 8, marginBottom: 16 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primaryGhost, borderWidth: 3,
    borderColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 20 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  starsLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 20 },
  commentInput: {
    width: '100%', minHeight: 80, maxHeight: 140,
    backgroundColor: COLORS.background, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: COLORS.text, textAlignVertical: 'top',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  submitBtn: {
    width: '100%', backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: 9999, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
  skipBtn: { marginTop: 14 },
  skipText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
});
