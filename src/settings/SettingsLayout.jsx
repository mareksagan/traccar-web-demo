// Outlet is handled by props.children in SolidJS Router v0.15
import SideNav from '../common/components/SideNav';
import BottomMenu from '../common/components/BottomMenu';

export default function SettingsLayout(props) {
  return (
    <div class="h-full flex flex-col md:flex-row">
      <div class="hidden md:block">
        <SideNav />
      </div>
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto p-4">
          {props.children}
        </div>
        <div class="md:hidden">
          <BottomMenu />
        </div>
      </div>
    </div>
  );
}
