import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {
  ShieldAlert,
  Mail,
  Copy,
  Check,
  ArrowLeft,
  Headphones,
  ExternalLink,
} from 'lucide-react-native';

interface AccountSuspendedModalProps {
  visible: boolean;
  reason?: string;
  userEmail?: string;
  onClose: () => void;
}

export const AccountSuspendedModal: React.FC<AccountSuspendedModalProps> = ({
  visible,
  reason,
  userEmail,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const adminEmail = 'admin@enterprise.com';

  const handleCopyEmail = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(adminEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEmailAdmin = () => {
    const subject = encodeURIComponent('Account Reactivation Request — Sales Analytics');
    const body = encodeURIComponent(
      `Hello Administrator,\n\nMy account (${userEmail || 'user'}) has been deactivated or removed. Could you please review my account status and assist in restoring access?\n\nThank you.`
    );
    const mailtoUrl = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    } else {
      Linking.openURL(mailtoUrl).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContent}>
          {/* shadcn Destructive Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.destructiveBadge}>
              <ShieldAlert size={12} color="#e11d48" />
              <Text style={styles.destructiveBadgeText}>ACCOUNT SUSPENDED</Text>
            </View>
          </View>

          {/* Framed 3D Illustration */}
          <View style={styles.illustrationFrame}>
            <Image
              source={
                Platform.OS === 'web'
                  ? { uri: '/account_suspended.jpg' }
                  : require('../assets/account_suspended.jpg')
              }
              defaultSource={require('../assets/account_suspended.jpg')}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Dialog Header */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Access Revoked by Administrator</Text>
            <Text style={styles.dialogDescription}>
              {reason || 'Your tenant account has been deactivated or removed by the system administrator.'}
            </Text>
          </View>

          {/* shadcn Alert / Contact Administrator Card */}
          <View style={styles.contactCard}>
            <View style={styles.contactCardHeader}>
              <View style={styles.contactIconPill}>
                <Headphones size={13} color="#18181b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactCardTitle}>System Administrator Support</Text>
                <Text style={styles.contactCardSub}>
                  Contact the primary enterprise admin to verify status or request account restoration.
                </Text>
              </View>
            </View>

            {/* Email Field with Copy Button */}
            <View style={styles.emailContainer}>
              <View style={styles.emailPill}>
                <Mail size={12} color="#71717a" />
                <Text style={styles.emailText}>{adminEmail}</Text>
              </View>

              <TouchableOpacity
                style={styles.ghostCopyBtn}
                onPress={handleCopyEmail}
                activeOpacity={0.7}
              >
                {copied ? (
                  <>
                    <Check size={11} color="#059669" />
                    <Text style={[styles.copyBtnText, { color: '#059669' }]}>Copied</Text>
                  </>
                ) : (
                  <>
                    <Copy size={11} color="#52525b" />
                    <Text style={styles.copyBtnText}>Copy</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* shadcn Dialog Footer Actions */}
          <View style={styles.dialogFooter}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailAdmin}
              activeOpacity={0.8}
            >
              <Mail size={13} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Email Administrator</Text>
              <ExternalLink size={12} color="#a1a1aa" style={{ marginLeft: 2 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <ArrowLeft size={13} color="#18181b" />
              <Text style={styles.outlineButtonText}>Return to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── SHADCN/UI ALERT DIALOG STYLES ──────────────────────────────────────────
const styles = StyleSheet.create({
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.7)', // Signature shadcn backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12, // shadcn rounded-lg
    borderWidth: 1,
    borderColor: '#e4e4e7', // zinc-200
    maxWidth: 440,
    width: '100%',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },

  // ── shadcn Destructive Badge
  badgeWrapper: {
    marginBottom: 12,
  },
  destructiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  destructiveBadgeText: {
    color: '#e11d48',
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },

  // ── Illustration Frame
  illustrationFrame: {
    width: '100%',
    height: 185,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f4f4f5',
    borderRadius: 10,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },

  // ── Dialog Header
  dialogHeader: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  dialogTitle: {
    fontSize: 16.5,
    fontWeight: '500',
    color: '#09090b', // zinc-950
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  dialogDescription: {
    fontSize: 12.5,
    color: '#71717a', // zinc-500
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 5,
    paddingHorizontal: 6,
  },

  // ── Contact Card / Alert
  contactCard: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  contactCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  contactIconPill: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#09090b',
  },
  contactCardSub: {
    fontSize: 11,
    color: '#71717a',
    lineHeight: 15,
    marginTop: 1,
  },

  // ── Email Field
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  emailText: {
    color: '#18181b',
    fontSize: 11.5,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  ghostCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 4,
  },
  copyBtnText: {
    color: '#3f3f46',
    fontSize: 10.5,
    fontWeight: '500',
  },

  // ── Dialog Footer
  dialogFooter: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#18181b', // Solid zinc-900
    paddingVertical: 9.5,
    borderRadius: 6, // shadcn rounded-md
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '500',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingVertical: 8.5,
    borderRadius: 6,
  },
  outlineButtonText: {
    color: '#18181b',
    fontSize: 12.5,
    fontWeight: '500',
  },
});
