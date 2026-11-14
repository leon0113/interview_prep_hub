import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isInteractiveTarget, isOverlayOpen, isTypingTarget } from './keys';

const CARD = 'article[data-question]';
const TOGGLE = '[data-answer-toggle]';

function cards(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(CARD)];
}

/** The card that has focus, else the first one still (partly) below the sticky header. */
function currentCard(list: HTMLElement[]): HTMLElement | undefined {
  const focused = document.activeElement?.closest<HTMLElement>(CARD);
  if (focused) return focused;
  return list.find((card) => card.getBoundingClientRect().bottom > 140) ?? list[0];
}

function focusCard(card: HTMLElement): void {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  card.focus({ preventScroll: true });
  card.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
}

interface Options {
  /** Single-question page: `j` / `k` go to these routes instead of to another card. */
  nextTo?: string;
  prevTo?: string;
  /** Set when the page has one card, so `j` / `k` never fall back to card navigation. */
  routeMode?: boolean;
}

/**
 * `j` / `k` move between question cards on the page, Space toggles the current answer.
 * Works on the DOM (`article[data-question]`), so it follows whatever the filters show.
 */
export function useQuestionShortcuts({ nextTo, prevTo, routeMode }: Options = {}): void {
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target) || isOverlayOpen()) return;

      const key = event.key.toLowerCase();
      const list = cards();

      if (key === 'j' || key === 'k') {
        const step = key === 'j' ? 1 : -1;
        if (routeMode) {
          const to = step === 1 ? nextTo : prevTo;
          if (to) navigate(to);
          return;
        }
        if (list.length === 0) return;
        const focused = document.activeElement?.closest<HTMLElement>(CARD);
        // First press selects the card in view; later presses move from the focused one.
        const target = focused
          ? list[list.indexOf(focused) + step]
          : (currentCard(list) ?? list[0]);
        if (target) {
          event.preventDefault();
          focusCard(target);
        }
        return;
      }

      if (event.key === ' ' && !isInteractiveTarget(event.target)) {
        const card = currentCard(list);
        const toggle = card?.querySelector<HTMLButtonElement>(TOGGLE);
        if (toggle) {
          event.preventDefault();
          toggle.click();
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, nextTo, prevTo, routeMode]);
}
