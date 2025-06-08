import { config } from '../config';

/**
 * Utility functions for working with environment variables and feature flags
 */

/**
 * Checks if a feature is enabled
 * @param featureName The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(
  featureName: keyof typeof config.features
): boolean {
  return !!config.features[featureName];
}

/**
 * Checks if the application is running in development mode
 * @returns boolean indicating if the application is in development mode
 */
export function isDevelopment(): boolean {
  return config.app.environment === 'development';
}

/**
 * Checks if the application is running in production mode
 * @returns boolean indicating if the application is in production mode
 */
export function isProduction(): boolean {
  return config.app.environment === 'production';
}

/**
 * Checks if the application is running in test mode
 * @returns boolean indicating if the application is in test mode
 */
export function isTest(): boolean {
  return config.app.environment === 'test';
}

/**
 * Checks if mocks are enabled
 * @returns boolean indicating if mocks are enabled
 */
export function areMocksEnabled(): boolean {
  return !!config.development.enableMocks;
}

/**
 * Checks if dev tools should be shown
 * @returns boolean indicating if dev tools should be shown
 */
export function showDevTools(): boolean {
  return !!config.development.showDevTools;
} 