import { Container, Zap, type LucideIcon } from 'lucide-react';
import type { GuideMeta } from '@/content/guides';

/** Lucide icon per guide (Docker: container, FastAPI: zap), for props that take an icon type. */
export const GUIDE_ICONS: Record<GuideMeta['icon'], LucideIcon> = {
  container: Container,
  zap: Zap,
};
