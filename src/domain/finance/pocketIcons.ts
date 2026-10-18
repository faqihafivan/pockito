import React from 'react';
import {
  Utensils,
  Home,
  Coffee,
  Car,
  ShieldCheck,
  PiggyBank,
  ShoppingBag,
  BookOpen,
  Smartphone,
  HeartPulse,
  Film,
  Smile,
  Plane,
  Gift,
  GraduationCap,
  Dumbbell,
  Briefcase,
  Zap,
  Music,
  Sparkles,
  Gem,
  Baby,
  Dog,
  Gamepad2,
} from 'lucide-react';

export interface PocketIconDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const POCKET_ICONS: PocketIconDefinition[] = [
  { id: 'Utensils', label: 'Makan & Minum', icon: Utensils },
  { id: 'Home', label: 'Kos & Tagihan', icon: Home },
  { id: 'Coffee', label: 'Kopi & Nongkrong', icon: Coffee },
  { id: 'Car', label: 'Transportasi', icon: Car },
  { id: 'ShieldCheck', label: 'Dana Darurat', icon: ShieldCheck },
  { id: 'PiggyBank', label: 'Tabungan', icon: PiggyBank },
  { id: 'ShoppingBag', label: 'Belanja', icon: ShoppingBag },
  { id: 'BookOpen', label: 'Buku & Belajar', icon: BookOpen },
  { id: 'Smartphone', label: 'Pulsa & Kuota', icon: Smartphone },
  { id: 'HeartPulse', label: 'Kesehatan', icon: HeartPulse },
  { id: 'Film', label: 'Streaming & Film', icon: Film },
  { id: 'Smile', label: 'Hiburan', icon: Smile },
  { id: 'Plane', label: 'Liburan & Trip', icon: Plane },
  { id: 'Gift', label: 'Hadiah & Amal', icon: Gift },
  { id: 'GraduationCap', label: 'Pendidikan', icon: GraduationCap },
  { id: 'Dumbbell', label: 'Olahraga & Gym', icon: Dumbbell },
  { id: 'Briefcase', label: 'Kerja & Bisnis', icon: Briefcase },
  { id: 'Zap', label: 'Listrik & Air', icon: Zap },
  { id: 'Music', label: 'Musik & Konser', icon: Music },
  { id: 'Sparkles', label: 'Self Care', icon: Sparkles },
  { id: 'Gem', label: 'Investasi & Emas', icon: Gem },
  { id: 'Baby', label: 'Keluarga & Anak', icon: Baby },
  { id: 'Dog', label: 'Peliharaan', icon: Dog },
  { id: 'Gamepad2', label: 'Gaming', icon: Gamepad2 },
];

export const ICON_MAP: Record<string, React.ElementType> = POCKET_ICONS.reduce(
  (acc, curr) => {
    acc[curr.id] = curr.icon;
    return acc;
  },
  {} as Record<string, React.ElementType>
);

export const getPocketIcon = (iconName?: string): React.ElementType => {
  if (!iconName) return Utensils;
  return ICON_MAP[iconName] || Utensils;
};

export const PRESET_COLORS = [
  { hex: '#713B3B', name: 'Burgundy Coklat' },
  { hex: '#FF7A59', name: 'Coral Oranye' },
  { hex: '#10B981', name: 'Mint Emerald' },
  { hex: '#0EA5E9', name: 'Cyan Sky' },
  { hex: '#FAAE2B', name: 'Saweria Amber' },
  { hex: '#8B5CF6', name: 'Lavender Ungu' },
  { hex: '#EC4899', name: 'Pink Rose' },
  { hex: '#14B8A6', name: 'Teal Laut' },
  { hex: '#F97316', name: 'Tangerine' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#84CC16', name: 'Lime Segar' },
  { hex: '#06B6D4', name: 'Cyan Aqua' },
  { hex: '#D97706', name: 'Gold Ochre' },
  { hex: '#BE185D', name: 'Magenta Ruby' },
  { hex: '#475569', name: 'Slate Gray' },
  { hex: '#18181B', name: 'Charcoal Dark' },
];

/**
 * Calculates whether a hex color is light or dark to provide optimal text contrast
 */
export const isColorLight = (hex: string): boolean => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return false;
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 155;
};
