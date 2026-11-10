import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { Chip, TextField } from '@/ui';
import type { ProductFilterState } from '../types';

type Props = {
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
};

export function ProductSearchBar({ filters, onChange }: Props) {
  const { spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md, gap: spacing.xs }}>
      <TextField
        value={filters.searchQuery}
        onChangeText={(text) => onChange({ ...filters, searchQuery: text })}
        placeholder="🔍 Tìm nhanh theo tên sản phẩm…"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        <Chip
          label="Tất cả kho"
          active={filters.stockFilter === 'all'}
          onPress={() => onChange({ ...filters, stockFilter: 'all' })}
        />
        <Chip
          label="Còn hàng (>0)"
          active={filters.stockFilter === 'in_stock'}
          onPress={() => onChange({ ...filters, stockFilter: 'in_stock' })}
        />
        <Chip
          label="Sắp hết (≤ 5)"
          active={filters.stockFilter === 'low_stock'}
          onPress={() => onChange({ ...filters, stockFilter: 'low_stock' })}
        />
        <Chip
          label="Hết hàng (0)"
          active={filters.stockFilter === 'out_of_stock'}
          onPress={() => onChange({ ...filters, stockFilter: 'out_of_stock' })}
        />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        <Chip
          label="Mới nhất"
          active={filters.sortBy === 'newest'}
          onPress={() => onChange({ ...filters, sortBy: 'newest' })}
        />
        <Chip
          label="Tên A-Z"
          active={filters.sortBy === 'name_asc'}
          onPress={() => onChange({ ...filters, sortBy: 'name_asc' })}
        />
        <Chip
          label="Giá thấp ➔ cao"
          active={filters.sortBy === 'price_asc'}
          onPress={() => onChange({ ...filters, sortBy: 'price_asc' })}
        />
        <Chip
          label="Giá cao ➔ thấp"
          active={filters.sortBy === 'price_desc'}
          onPress={() => onChange({ ...filters, sortBy: 'price_desc' })}
        />
        <Chip
          label="Tồn kho nhiều"
          active={filters.sortBy === 'stock_desc'}
          onPress={() => onChange({ ...filters, sortBy: 'stock_desc' })}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
  },
});
