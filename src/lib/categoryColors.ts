import type { Category } from '../types/expense'

// dataviz skill categorical palette (slots 1-6), validated for light/dark via
// scripts/validate_palette.js — keep this order, never cycle/reassign per-render.
export const CATEGORY_COLORS: Record<Category, string> = {
  食費: '#2a78d6',
  生活費: '#eb6834',
  趣味: '#1baf7a',
  外食費: '#eda100',
  衣類: '#e87ba4',
  その他: '#008300',
}
