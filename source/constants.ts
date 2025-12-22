
// Priority levels
export type Priority = 'low' | 'medium' | 'high';

const PRIORITY_LOW: Priority = 'low';
const PRIORITY_MEDIUM: Priority = 'medium';
const PRIORITY_HIGH: Priority = 'high';

// Priority icons
const PRIORITY_ICONS = {
  low: '⬇️',
  medium: '➡️',
  high: '⬆️'
};

const ALL_TODOS = 'all';
const ACTIVE_TODOS = 'active';
const COMPLETED_TODOS = 'completed';
const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

export {
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  PRIORITY_HIGH,
  PRIORITY_ICONS,
  ALL_TODOS,
  ACTIVE_TODOS,
  COMPLETED_TODOS,
  ENTER_KEY,
  ESCAPE_KEY
};
