// hooks/useDeviceId.ts
import { useEffect, useState } from 'react';
import { getDeviceId } from '@/utils/deviceId';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getDeviceId().then((id) => {
      if (mounted) {
        setDeviceId(id);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { deviceId, isLoading };
}

// Usage in component
export function ProjectCard() {
  const { deviceId } = useDeviceId();
  
  const handleLike = async () => {
    if (!deviceId) return;
    
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'X-Device-ID': deviceId },
      body: JSON.stringify({ projectId: 'proj_123' })
    });
  };
  
  return <button onClick={handleLike}>❤️ Like</button>;
}