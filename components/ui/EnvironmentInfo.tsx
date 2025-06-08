'use client';

import { config } from '@/lib/config';
import { isDevelopment, showDevTools } from '@/lib/utils/env';

/**
 * A component that displays environment information when in development mode
 * and dev tools are enabled
 */
export default function EnvironmentInfo() {
  // On the client side, we need to handle missing env vars gracefully
  try {
    // Only show in development mode with dev tools enabled
    if (!isDevelopment() || !showDevTools()) {
      return null;
    }

    return (
      <div className="fixed bottom-0 right-0 m-4 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-80 z-50 max-w-xs">
        <h5 className="font-bold mb-1">Environment Info</h5>
        <ul className="space-y-1">
          <li>
            <span className="font-semibold">Env:</span> {config?.app?.environment || 'Unknown'}
          </li>
          <li>
            <span className="font-semibold">URL:</span> {config?.app?.url || 'Not set'}
          </li>
          <li>
            <span className="font-semibold">API:</span>{' '}
            {config?.api?.url || 'Not configured'}
          </li>
          <li>
            <span className="font-semibold">Mocks:</span>{' '}
            {config?.development?.enableMocks ? 'Enabled' : 'Disabled'}
          </li>
        </ul>
      </div>
    );
  } catch (error) {
    // If there's an error with config, don't show the component
    console.error('Error rendering EnvironmentInfo:', error);
    return null;
  }
} 