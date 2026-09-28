import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  X,
  ShoppingBag,
  Coins,
  Calendar,
  MapPin,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { createSale, CreateSaleInput } from '../services/api';

interface AddSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Footwear',
  'Home & Kitchen',
  'Books',
  'General',
];

const REGIONS = [
  'Hyderabad',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Pune',
  'General',
];

export const AddSaleModal: React.FC<AddSaleModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [region, setRegion] = useState('Hyderabad');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Completed' | 'Pending' | 'Cancelled'>('Completed');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated total preview
  const qtyNum = parseInt(quantity, 10) || 0;
  const priceNum = parseFloat(price) || 0;
  const calculatedTotal = (qtyNum * priceNum).toFixed(2);

  const handleSubmit = async () => {
    setError(null);

    if (!productName.trim()) {
      setError('Please enter a product name.');
      return;
    }

    if (qtyNum <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (priceNum <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      await createSale({
        productName: productName.trim(),
        category: category.trim(),
        quantity: qtyNum,
        price: priceNum,
        saleDate,
        region,
        customerName: customerName.trim() || 'Direct Customer',
        status,
      });

      // Reset form
      setProductName('');
      setPrice('');
      setQuantity('1');
      setCustomerName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create sale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Plus size={18} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Record New Sale</Text>
              <Text style={styles.sub}>
                Data will be securely tied to your authenticated user workspace
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#09090b" />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <AlertCircle size={15} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
            <View style={styles.form}>
              {/* Product Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dell XPS 15 Laptop"
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>

              {/* Category Pills */}
              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pill, category === cat && styles.pillActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Quantity & Unit Price */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="1"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>

                <View style={[styles.field, { flex: 1.5 }]}>
                  <Text style={styles.label}>Unit Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="e.g. 45000"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              </View>

              {/* Total Calculation Preview */}
              <View style={styles.totalPreview}>
                <Text style={styles.totalLabel}>Computed Total Amount:</Text>
                <Text style={styles.totalAmount}>
                  ₹{Number(calculatedTotal).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Customer Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Customer / Client Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Acme Tech Solutions"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              {/* Region Pills */}
              <View style={styles.field}>
                <Text style={styles.label}>Territory / Region</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                  {REGIONS.map((reg) => (
                    <TouchableOpacity
                      key={reg}
                      style={[styles.pill, region === reg && styles.pillActive]}
                      onPress={() => setRegion(reg)}
                    >
                      <Text style={[styles.pillText, region === reg && styles.pillTextActive]}>
                        {reg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Sale Date & Status */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Sale Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={saleDate}
                    onChangeText={setSaleDate}
                  />
                </View>

                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Fulfillment Status</Text>
                  <View style={styles.statusRow}>
                    {(['Completed', 'Pending'] as const).map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.statusBtn, status === st && styles.statusBtnActive]}
                        onPress={() => setStatus(st)}
                      >
                        <Text
                          style={[
                            styles.statusBtnText,
                            status === st && styles.statusBtnTextActive,
                          ]}
                        >
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                disabled={loading}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Add Sale to Ledger</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.xl,
    padding: 20,
    ...THEME.shadow.modal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: THEME.fontFamily.bold,
    fontWeight: '500',
    color: '#09090b',
  },
  sub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: THEME.fontFamily.regular,
  },
  closeBtn: {
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: THEME.radius.md,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    fontFamily: THEME.fontFamily.medium,
    flex: 1,
  },
  form: {
    gap: 12,
  },
  field: {
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.medium,
    fontWeight: '500',
    color: '#09090b',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#09090b',
    backgroundColor: '#f8fafc',
    outlineWidth: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pillScroll: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#09090b',
  },
  pillText: {
    fontSize: 11,
    fontFamily: THEME.fontFamily.medium,
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
    fontFamily: THEME.fontFamily.semibold,
  },
  totalPreview: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: THEME.radius.md,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.medium,
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 16,
    fontFamily: THEME.fontFamily.bold,
    fontWeight: '500',
    color: '#09090b',
  },
  statusRow: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: THEME.radius.md,
    padding: 3,
  },
  statusBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
  },
  statusBtnActive: {
    backgroundColor: '#ffffff',
    ...THEME.shadow.card,
  },
  statusBtnText: {
    fontSize: 11,
    fontFamily: THEME.fontFamily.medium,
    color: '#64748b',
  },
  statusBtnTextActive: {
    color: '#09090b',
    fontFamily: THEME.fontFamily.semibold,
  },
  submitBtn: {
    backgroundColor: '#09090b',
    height: 42,
    borderRadius: THEME.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: THEME.fontFamily.semibold,
    fontWeight: '500',
  },
});
