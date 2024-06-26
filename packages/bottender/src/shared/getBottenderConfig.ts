import path from 'path';

import dotenv from 'dotenv';
import { JsonObject } from 'type-fest';

import { BottenderConfig } from '../types';

import { getBottenderConfigFromGlobals } from './getGlobalVars';

dotenv.config();

/**
 * By default, it will try to require the module from globals, if not found, then `<root>/bottender.config.js`.
 */
const getBottenderConfig = async (): Promise<BottenderConfig> => {
  try {
    try {
      return getBottenderConfigFromGlobals();
    } catch {
      return (await import(path.resolve('bottender.config.ts'))).default;
    }
  } catch (err) {
    if (
      (err as JsonObject).code &&
      (err as JsonObject).code === 'MODULE_NOT_FOUND'
    ) {
      return {};
    }
    throw err;
  }
};

export default getBottenderConfig;
