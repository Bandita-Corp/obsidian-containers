import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SyncServerEventDto } from '@workspace/shared';
import { CONTAINER_KEYS } from './useContainers';
import { TIME_MACHINE_KEYS } from './useTimeMachine';

export type SSEConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

export function useSyncEvents(activeContainerId: string | null) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SSEConnectionStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<SyncServerEventDto | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      try {
        eventSource = new EventSource('/sync/events');
        setStatus('connecting');

        eventSource.onopen = () => {
          setStatus('connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const data: SyncServerEventDto = JSON.parse(event.data);
            setLastEvent(data);

            // Invalidate all container lists & statuses
            queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.lists() });

            if (activeContainerId) {
              queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.tree(activeContainerId) });
              queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.detail(activeContainerId) });
              queryClient.invalidateQueries({ queryKey: TIME_MACHINE_KEYS.commits(activeContainerId) });
            }
          } catch (err) {
            console.error('Failed to parse SSE event data', err);
          }
        };

        eventSource.onerror = () => {
          setStatus('error');
          if (eventSource) {
            eventSource.close();
          }
          // Attempt reconnection in 5s
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch (err) {
        setStatus('error');
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [queryClient, activeContainerId]);

  return { status, lastEvent };
}
