import { Container, Zap } from 'lucide-react';
import type { GuideMeta } from '@/content/guides';

/** The icon of a guide (Docker: container, FastAPI: zap). */
export function GuideIcon({ icon, className }: { icon: GuideMeta['icon']; className?: string }) {
  return icon === 'zap' ? (
    <Zap className={className} aria-hidden />
  ) : (
    <Container className={className} aria-hidden />
  );
}
