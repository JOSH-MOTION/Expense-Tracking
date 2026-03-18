// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // System
  'house.fill':                              'home',
  'paperplane.fill':                         'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right':                           'chevron-right',

  // ── Tab bar icons ──
  'arrow.left.arrow.right':                  'swap-horiz',
  'chart.pie.fill':                          'pie-chart',
  'gearshape.fill':                          'settings',
  'plus':                                    'add',

  // ── Common UI ──
  'magnifyingglass':                         'search',
  'bell.fill':                               'notifications',
  'person.fill':                             'person',
  'creditcard.fill':                         'credit-card',
  'arrow.down.circle.fill':                  'arrow-circle-down',
  'checkmark.circle.fill':                   'check-circle',
  'xmark.circle.fill':                       'cancel',
  'info.circle':                             'info',
  'exclamationmark.triangle':                'warning',
  'trash':                                   'delete',
  'pencil':                                  'edit',
  'square.and.arrow.up':                     'share',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name] ?? 'help-outline'}
      style={style}
    />
  );
}