/**
 * Alert module exports
 *
 * @ai-context Alert dialog interface and singleton for dependency injection
 */

export {
  type AlertInterface,
  type AlertButton,
  type AlertButtonStyle,
} from './alert.js';
export {
  initializeAlertService,
  getAlertService,
  resetAlertService,
} from './alert-singleton.js';
