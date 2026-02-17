import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';

const SELLER_REASONS = [
  { id: 'client_cancelled', label: 'Клиент отменил' },
  { id: 'address_error', label: 'Ошибка в адресе' },
  { id: 'no_stock', label: 'Нет товара' },
  { id: 'other', label: 'Другая причина' },
];

const COURIER_REASONS = [
  { id: 'transport', label: 'Не подходит транспорт' },
  { id: 'too_far', label: 'Слишком далеко' },
  { id: 'busy', label: 'Занят' },
  { id: 'other', label: 'Другая причина' },
];

export default function CancelReasonModal({ visible, onClose, onSubmit, role }) {
  const [selected, setSelected] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const reasons = role === 'seller' ? SELLER_REASONS : COURIER_REASONS;

  const handleSubmit = () => {
    if (!selected) return;
    const reason = selected === 'other' ? customReason.trim() : reasons.find(r => r.id === selected)?.label;
    if (!reason) return;
    onSubmit(reason);
    setSelected(null);
    setCustomReason('');
  };

  const handleClose = () => {
    setSelected(null);
    setCustomReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Причина отмены</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {reasons.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.option, selected === r.id && styles.optionSelected]}
              onPress={() => setSelected(r.id)}
            >
              <View style={[styles.radio, selected === r.id && styles.radioSelected]}>
                {selected === r.id && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, selected === r.id && styles.optionTextSelected]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}

          {selected === 'other' && (
            <TextInput
              style={styles.customInput}
              placeholder="Опишите причину..."
              placeholderTextColor={COLORS.textMuted}
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              maxLength={300}
            />
          )}

          <TouchableOpacity
            style={[styles.submitBtn, (!selected || (selected === 'other' && !customReason.trim())) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!selected || (selected === 'other' && !customReason.trim())}
          >
            <Text style={styles.submitText}>Отменить заказ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 34, ...SHADOWS.large,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { ...FONTS.h3 },
  closeBtn: { padding: 4 },

  option: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 14, marginBottom: 8, backgroundColor: COLORS.cardAlt, gap: 12,
  },
  optionSelected: { backgroundColor: COLORS.primaryGhost, borderWidth: 1.5, borderColor: COLORS.primary },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  optionText: { ...FONTS.body, color: COLORS.text },
  optionTextSelected: { fontWeight: '600', color: COLORS.primary },

  customInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14,
    ...FONTS.body, minHeight: 80, textAlignVertical: 'top', marginBottom: 12, marginTop: 4,
  },

  submitBtn: {
    backgroundColor: COLORS.danger, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
