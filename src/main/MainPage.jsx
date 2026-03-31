import { createSignal, createEffect, Show, onMount, onCleanup } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { devices, devicesActions, session, createPersistedState } from '../stores';
import { useTranslation } from '../common/components/LocalizationProvider';
import MainMap from './MainMap';
import DeviceList from './DeviceList';
import MainToolbar from './MainToolbar';
import BottomMenu from '../common/components/BottomMenu';
import StatusCard from '../common/components/StatusCard';
import EventsDrawer from './EventsDrawer';

export default function MainPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [desktop, setDesktop] = createSignal(window.innerWidth >= 768);
  const [devicesOpen, setDevicesOpen] = createSignal(desktop());
  const [eventsOpen, setEventsOpen] = createSignal(false);
  const [keyword, setKeyword] = createSignal('');
  const [filter, setFilter] = createPersistedState('filter', { statuses: [], groups: [] });
  const [filteredDevices, setFilteredDevices] = createSignal([]);
  const [filteredPositions, setFilteredPositions] = createSignal([]);

  const selectedPosition = () => {
    const id = devices.selectedId;
    return id ? session.positions[id] : null;
  };

  // Filter devices based on keyword and filter
  createEffect(() => {
    const allDevices = Object.values(devices.items);
    let result = allDevices;
    
    if (keyword()) {
      const lowerKeyword = keyword().toLowerCase();
      result = result.filter((d) => 
        d.name.toLowerCase().includes(lowerKeyword) ||
        d.uniqueId.toLowerCase().includes(lowerKeyword)
      );
    }
    
    if (filter().statuses?.length > 0) {
      result = result.filter((d) => filter().statuses.includes(d.status));
    }
    
    setFilteredDevices(result);
    
    // Update filtered positions
    const positions = result
      .map((d) => session.positions[d.id])
      .filter(Boolean);
    setFilteredPositions(positions);
  });

  // Handle resize
  onMount(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setDesktop(isDesktop);
      if (isDesktop && !devicesOpen()) {
        setDevicesOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // Close device list on mobile when device selected
  createEffect(() => {
    if (!desktop() && devices.selectedId) {
      setDevicesOpen(false);
    }
  });

  return (
    <div class="h-full w-full relative">
      {/* Desktop Map */}
      <Show when={desktop()}>
        <div class="absolute inset-0">
          <MainMap
            filteredPositions={filteredPositions()}
            selectedPosition={selectedPosition()}
            onEventsClick={() => setEventsOpen(true)}
          />
        </div>
      </Show>

      {/* Sidebar */}
      <div 
        class={`absolute z-10 flex flex-col transition-transform ${
          desktop() 
            ? 'left-4 top-4 bottom-4 w-[360px]' 
            : 'inset-0 w-full h-full'
        }`}
        style={{
          transform: desktop() || devicesOpen() ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Toolbar */}
        <div class="pointer-events-auto rounded-t-lg shadow-lg">
          <MainToolbar
            filteredDevices={filteredDevices()}
            devicesOpen={devicesOpen()}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword()}
            setKeyword={setKeyword}
            filter={filter()}
            setFilter={setFilter}
          />
        </div>
        
        {/* Content */}
        <div class="flex-1 relative" style={{ 'min-height': desktop() ? '0' : '100%' }}>
          {/* Mobile Map - Outside flex container to ensure proper sizing */}
          <Show when={!desktop()}>
            <div class="fixed inset-0 top-[64px] bottom-[56px]">
              <MainMap
                filteredPositions={filteredPositions()}
                selectedPosition={selectedPosition()}
                onEventsClick={() => setEventsOpen(true)}
              />
            </div>
          </Show>
          
          {/* Device List */}
          <Show when={desktop() || devicesOpen()}>
            <div 
              class={`absolute inset-0 bg-white dark:bg-gray-800 shadow-lg ${
                desktop() ? '' : 'z-20'
              }`}
              style={{ 'border-radius': desktop() ? '0 0 8px 8px' : '0' }}
            >
              <DeviceList devices={filteredDevices()} />
            </div>
          </Show>
        </div>
        
        {/* Desktop Bottom Menu */}
        <Show when={desktop()}>
          <div class="mt-4 pointer-events-auto shadow-lg rounded-lg overflow-hidden">
            <BottomMenu />
          </div>
        </Show>
      </div>

      {/* Mobile Bottom Menu */}
      <Show when={!desktop()}>
        <BottomMenu />
      </Show>

      {/* Status Card */}
      <Show when={devices.selectedId}>
        <StatusCard
          deviceId={devices.selectedId}
          position={selectedPosition()}
          onClose={() => devicesActions.selectId(null)}
          desktopPadding={desktop() ? 400 : undefined}
        />
      </Show>

      {/* Events Drawer */}
      <EventsDrawer
        open={eventsOpen()}
        onClose={() => setEventsOpen(false)}
      />
    </div>
  );
}
