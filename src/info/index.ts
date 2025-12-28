/**
 * Info module exports
 *
 * @ai-context Info display interface and singleton for dependency injection
 */

export { type InfoInterface, InfoType } from './info.js';
export {
  initializeInfoService,
  getInfoService,
  resetInfoService,
} from './info-singleton.js';
