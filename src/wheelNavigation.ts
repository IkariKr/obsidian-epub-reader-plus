export const WHEEL_PAGE_TURN_COOLDOWN_MS = 350;

export type WheelPageAction = 'next' | 'prev' | null;

export interface WheelPageInput {
  deltaY: number;
  isPaginated: boolean;
  enabled: boolean;
  isModified: boolean;
  now: number;
  lastTurnAt: number;
}

/**
 * 根据滚轮事件决定分页阅读器的翻页方向。
 * Determines the page-turn direction for a wheel event in paginated reading mode.
 */
export function getWheelPageAction(input: WheelPageInput): WheelPageAction {
  if (
    !input.isPaginated ||
    !input.enabled ||
    input.isModified ||
    input.deltaY === 0 ||
    input.now - input.lastTurnAt < WHEEL_PAGE_TURN_COOLDOWN_MS
  ) {
    return null;
  }

  return input.deltaY > 0 ? 'next' : 'prev';
}
