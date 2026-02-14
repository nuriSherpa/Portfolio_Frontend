'use client';

import { useEffect } from 'react';

export function usePreventRefreshSpam() {
  useEffect(() => {
    let refreshCount = parseInt(sessionStorage.getItem('refresh_count') || '0');
    const lastRefresh = parseInt(sessionStorage.getItem('last_refresh') || '0');
    const now = Date.now();

    // Reset count if more than 10 seconds passed
    if (now - lastRefresh > 10000) {
      refreshCount = 0;
    }

    refreshCount++;
    sessionStorage.setItem('refresh_count', refreshCount.toString());
    sessionStorage.setItem('last_refresh', now.toString());

    // Block if more than 3 refreshes in 10 seconds
    if (refreshCount > 3) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <div style="text-align:center;">
            <h1 style="font-size:24px;margin-bottom:16px;">Please Stop Refreshing</h1>
            <p>Too many refreshes detected. Wait 10 seconds.</p>
          </div>
        </div>
      `;

      setTimeout(() => {
        sessionStorage.removeItem('refresh_count');
        window.location.reload();
      }, 10000);
    }
  }, []);
}
