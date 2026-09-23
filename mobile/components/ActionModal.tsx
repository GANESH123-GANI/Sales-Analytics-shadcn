import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Check, Bell } from 'lucide-react-native';
import { THEME } from '../constants/theme';

// ─── Generic Confirmation / Info Modal ───────────────────────────────────────
interface InfoModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger' | 'success';
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}) => {
  const confirmColor =
    variant === 'danger'
      ? THEME.colors.status.cancelledText
      : variant === 'success'
      ? THEME.colors.status.completedText
      : THEME.colors.primary;

  const confirmBg =
    variant === 'danger'
      ? THEME.colors.status.cancelledBg
      : variant === 'success'
      ? THEME.colors.status.successBg
      : THEME.colors.primary;

  const confirmTextColor =
    variant === 'default' ? THEME.colors.primaryForeground : confirmColor;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoMessage}>{message}</Text>
          <View style={styles.infoActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: variant === 'default' ? THEME.colors.primary : confirmBg,
                  borderWidth: variant !== 'default' ? 1 : 0,
                  borderColor: variant !== 'default' ? confirmColor : 'transparent',
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={[styles.confirmBtnText, { color: confirmTextColor }]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Field type for form modal ────────────────────────────────────────────────
export interface FormField {
  key: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  required?: boolean;
}

// ─── Generic Form Modal ───────────────────────────────────────────────────────
interface FormModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  visible,
  title,
  subtitle,
  fields,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) => {
  const initialValues: Record<string, string> = Object.fromEntries(fields.map((f) => [f.key, '']));
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.key]?.trim()) {
        newErrors[f.key] = `${f.label} is required`;
      }
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSubmit(values);
    setValues(initialValues);
    setErrors({});
  };

  const handleCancel = () => {
    setValues(initialValues);
    setErrors({});
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.formBox}>
          <View style={styles.formHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formTitle}>{title}</Text>
              {subtitle && <Text style={styles.formSubtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCancel} activeOpacity={0.7}>
              <X size={16} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    errors[field.key] ? styles.fieldInputError : null,
                    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                  ]}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  placeholderTextColor={THEME.colors.textMuted}
                  value={values[field.key]}
                  onChangeText={(t) => handleChange(field.key, t)}
                  keyboardType={field.keyboardType || 'default'}
                  autoCapitalize="none"
                />
                {errors[field.key] ? (
                  <Text style={styles.errorText}>{errors[field.key]}</Text>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.formFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Check size={13} color={THEME.colors.primaryForeground} style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>{submitLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Detail View Modal ────────────────────────────────────────────────────────
export interface DetailRow { label: string; value: string | number; highlight?: boolean; }

interface DetailModalProps {
  visible?: boolean;
  title: string;
  subtitle?: string;
  rows?: DetailRow[];
  data?: Record<string, any>;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  visible = true,
  title,
  subtitle,
  rows,
  data,
  onClose,
  actionLabel,
  onAction,
}) => {
  const displayRows: DetailRow[] =
    rows ||
    (data
      ? Object.entries(data).map(([label, value]) => ({ label, value: String(value) }))
      : []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.formBox}>
          <View style={styles.formHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formTitle}>{title}</Text>
              {subtitle && <Text style={styles.formSubtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={16} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
            {displayRows.map((row, i) => (
              <View key={i} style={[styles.detailRow, i === displayRows.length - 1 && styles.detailRowLast]}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={[styles.detailValue, row.highlight && styles.detailValueHighlight]}>
                  {String(row.value)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.formFooter}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
          {actionLabel && onAction && (
            <TouchableOpacity style={styles.submitBtn} onPress={onAction} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  </Modal>
  );
};

// ─── Notification Panel Modal ─────────────────────────────────────────────────
const DEFAULT_NOTIFICATIONS = [
  { id: '1', title: 'New order received',   body: 'ORD-046 from Hyderabad has been created.',             time: '2m ago',  unread: true },
  { id: '2', title: 'Payment follow-up',    body: 'A customer payment reminder is due for this week.',     time: '1h ago',  unread: true },
  { id: '3', title: 'Target achieved',      body: 'Monthly revenue target of ₹8L has been met!',          time: '3h ago',  unread: false },
  { id: '4', title: 'Low stock alert',      body: '2 product lines are running low. Reorder soon.',       time: '1d ago',  unread: false },
];

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.notifBox}>
        <View style={styles.formHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Bell size={15} color={THEME.colors.textPrimary} />
            <Text style={styles.formTitle}>Notifications</Text>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {DEFAULT_NOTIFICATIONS.filter((n) => n.unread).length}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={16} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {DEFAULT_NOTIFICATIONS.map((n) => (
            <View key={n.id} style={[styles.notifRow, n.unread && styles.notifRowUnread]}>
              {n.unread && <View style={styles.unreadDot} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody}>{n.body}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoBox: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    ...THEME.shadow.modal,
  },
  infoTitle: {
    fontSize: THEME.fontSize.xl,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 10,
  },
  infoMessage: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  infoActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  formBox: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    ...THEME.shadow.modal,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  formTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
  formSubtitle: {
    fontSize: THEME.fontSize.sm,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    marginTop: 3,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.secondary,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: THEME.colors.destructive,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: THEME.colors.input,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: THEME.fontSize.base,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.muted,
    height: 40,
  },
  fieldInputError: {
    borderColor: THEME.colors.destructive,
  },
  errorText: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.destructive,
    marginTop: 4,
  },
  formFooter: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.card,
  },
  cancelBtnText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  confirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: THEME.radius.md,
  },
  confirmBtnText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primary,
  },
  submitBtnText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.primaryForeground,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: THEME.fontSize.base,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
    flex: 1.2,
    textAlign: 'right',
  },
  detailValueHighlight: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    fontSize: THEME.fontSize.md,
  },
  notifBox: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.xl,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: 480,
    ...THEME.shadow.modal,
  },
  unreadBadge: {
    backgroundColor: THEME.colors.status.cancelledText,
    borderRadius: THEME.radius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: THEME.fontSize.xs,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  notifRowUnread: {
    backgroundColor: THEME.colors.status.infoBg,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.chart.blue,
    marginTop: 4,
    flexShrink: 0,
  },
  notifTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  notifBody: {
    fontSize: THEME.fontSize.sm,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
