import { onMount, onCleanup, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { session, sessionActions, devicesActions, eventsActions, errorsActions } from './stores';
import alarm from './resources/alarm.mp3';
import { createPersistedState } from './stores';

const logoutCode = 4000;

export default function SocketController() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = createSignal([]);
  const [soundEvents] = createPersistedState('soundEvents', '');
  const [soundAlarms] = createPersistedState('soundAlarms', 'sos');
  
  let socket;
  let reconnectTimeout;

  const clearReconnectTimeout = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const handleEvents = (events) => {
    eventsActions.add(events);
    
    const shouldPlaySound = events.some((e) =>
      soundEvents().includes(e.type) ||
      (e.type === 'alarm' && soundAlarms().includes(e.attributes?.alarm))
    );
    
    if (shouldPlaySound) {
      new Audio(alarm).play().catch(() => {});
    }
    
    setNotifications(events.map((event) => ({
      id: event.id,
      message: event.attributes?.message || event.type,
      show: true,
    })));
  };

  const connectSocket = () => {
    clearReconnectTimeout();
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${window.location.host}/api/socket`);

    socket.onopen = () => {
      sessionActions.updateSocket(true);
    };

    socket.onclose = async (event) => {
      sessionActions.updateSocket(false);
      if (event.code !== logoutCode) {
        try {
          const devicesResponse = await fetch('/api/devices');
          if (devicesResponse.ok) {
            devicesActions.update(await devicesResponse.json());
          }
          const positionsResponse = await fetch('/api/positions');
          if (positionsResponse.ok) {
            sessionActions.updatePositions(await positionsResponse.json());
          }
          if (devicesResponse.status === 401 || positionsResponse.status === 401) {
            navigate('/login');
          }
        } catch {
          // ignore
        }
        clearReconnectTimeout();
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          connectSocket();
        }, 60000);
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.devices) {
          devicesActions.update(data.devices);
        }
        if (data.positions) {
          sessionActions.updatePositions(data.positions);
        }
        if (data.events) {
          handleEvents(data.events);
        }
        if (data.logs) {
          sessionActions.updateLogs(data.logs);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };
  };

  // Fetch positions periodically as fallback
  let pollInterval;
  
  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      if (response.ok) {
        sessionActions.updatePositions(await response.json());
      }
    } catch (error) {
      // ignore
    }
  };

  // Connect when authenticated
  createEffect(async () => {
    if (session.user) {
      try {
        // Fetch initial devices and positions
        const [devicesRes, positionsRes] = await Promise.all([
          fetch('/api/devices'),
          fetch('/api/positions'),
        ]);
        
        if (devicesRes.ok) {
          devicesActions.refresh(await devicesRes.json());
        }
        if (positionsRes.ok) {
          sessionActions.updatePositions(await positionsRes.json());
        }
      } catch (error) {
        errorsActions.push(error.message);
      }
      
      connectSocket();
      
      // Start periodic polling every 30 seconds as fallback
      pollInterval = setInterval(fetchPositions, 30000);
      
      return () => {
        clearReconnectTimeout();
        clearInterval(pollInterval);
        socket?.close(logoutCode);
      };
    }
  });

  // Send log preference
  createEffect(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ logs: session.includeLogs }));
    }
  });

  // Handle visibility change for reconnection
  onMount(() => {
    const reconnectIfNeeded = () => {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        connectSocket();
      } else if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send('{}');
        } catch {
          // test connection
        }
      }
    };
    
    const onVisibility = () => {
      if (!document.hidden && session.user) {
        reconnectIfNeeded();
      }
    };
    
    const onOnline = () => {
      if (session.user) {
        reconnectIfNeeded();
      }
    };
    
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });

  return (
    <>
      <For each={notifications()}>
        {(notification) => (
          <div class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            {notification.message}
            <button
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
              class="ml-2 text-gray-400 hover:text-white"
            >
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        )}
      </For>
    </>
  );
}
