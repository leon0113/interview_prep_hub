import { ChartColumn, Container, Grid3x3, Zap, type LucideIcon } from 'lucide-react';
import type { GuideMeta } from '@/content/guides';

/** Lucide icon per guide (Docker: container, FastAPI: zap, Data Visualization: chart, NumPy: grid), for props that take an icon type. */
export const GUIDE_ICONS: Record<GuideMeta['icon'], LucideIcon> = {
  container: Container,
  zap: Zap,
  chart: ChartColumn,
  grid: Grid3x3,
};
