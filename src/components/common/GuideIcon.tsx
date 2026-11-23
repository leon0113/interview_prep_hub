import { ChartColumn, Container, Grid3x3, Zap } from 'lucide-react';
import type { GuideMeta } from '@/content/guides';

/** The icon of a guide (Docker: container, FastAPI: zap, Data Visualization: chart, NumPy: grid). */
export function GuideIcon({ icon, className }: { icon: GuideMeta['icon']; className?: string }) {
  if (icon === 'zap') return <Zap className={className} aria-hidden />;
  if (icon === 'chart') return <ChartColumn className={className} aria-hidden />;
  if (icon === 'grid') return <Grid3x3 className={className} aria-hidden />;
  return <Container className={className} aria-hidden />;
}
