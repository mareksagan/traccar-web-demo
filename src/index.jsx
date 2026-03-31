/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { LocalizationProvider } from './common/components/LocalizationProvider';
import './index.css';

// Remove the initial HTML loader
const initialLoader = document.querySelector('.loader');
if (initialLoader) {
  initialLoader.remove();
}

// Pages
import App from './App';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import ResetPasswordPage from './login/ResetPasswordPage';
import ChangeServerPage from './login/ChangeServerPage';
import MainPage from './main/MainPage';

// Settings pages
import SettingsLayout from './settings/SettingsLayout';
import PreferencesPage from './settings/PreferencesPage';
import ServerPage from './settings/ServerPage';
import UsersPage from './settings/UsersPage';
import UserPage from './settings/UserPage';
import DevicesPage from './settings/DevicesPage';
import DevicePage from './settings/DevicePage';
import GroupsPage from './settings/GroupsPage';
import GroupPage from './settings/GroupPage';
import GeofencesPage from './settings/GeofencesPage';
import GeofencePage from './settings/GeofencePage';
import DriversPage from './settings/DriversPage';
import DriverPage from './settings/DriverPage';
import CalendarsPage from './settings/CalendarsPage';
import CalendarPage from './settings/CalendarPage';
import MaintenancesPage from './settings/MaintenancesPage';
import MaintenancePage from './settings/MaintenancePage';
import CommandsPage from './settings/CommandsPage';
import CommandPage from './settings/CommandPage';
import NotificationsPage from './settings/NotificationsPage';
import NotificationPage from './settings/NotificationPage';
import ComputedAttributesPage from './settings/ComputedAttributesPage';
import ComputedAttributePage from './settings/ComputedAttributePage';

// Reports pages
import ReportsLayout from './reports/ReportsLayout';
import RouteReportPage from './reports/RouteReportPage';
import TripReportPage from './reports/TripReportPage';
import StopReportPage from './reports/StopReportPage';
import SummaryReportPage from './reports/SummaryReportPage';
import EventReportPage from './reports/EventReportPage';
import ChartReportPage from './reports/ChartReportPage';
import StatisticsPage from './reports/StatisticsPage';

// Other pages
import ReplayPage from './other/ReplayPage';
import GeofencesListPage from './other/GeofencesList';
import PositionPage from './other/PositionPage';
import EventPage from './other/EventPage';
import GeofenceTestPage from './other/GeofenceTestPage';
import Loader from './common/components/Loader';

const root = document.getElementById('root');

render(() => (
  <LocalizationProvider>
    <Router>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/change-server" component={ChangeServerPage} />
      
      <Route path="/" component={App}>
        <Route path="/" component={MainPage} />
        
        <Route path="/position/:id" component={PositionPage} />
        <Route path="/event/:id" component={EventPage} />
        <Route path="/replay" component={ReplayPage} />
        <Route path="/geofences" component={GeofencesListPage} />
        <Route path="/test/geofences" component={GeofenceTestPage} />
        
        <Route path="/settings" component={SettingsLayout}>
          <Route path="/" component={PreferencesPage} />
          <Route path="/preferences" component={PreferencesPage} />
          <Route path="/server" component={ServerPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/user/:id?" component={UserPage} />
          <Route path="/devices" component={DevicesPage} />
          <Route path="/device/:id?" component={DevicePage} />
          <Route path="/groups" component={GroupsPage} />
          <Route path="/group/:id?" component={GroupPage} />
          <Route path="/geofences" component={GeofencesPage} />
          <Route path="/geofence/:id?" component={GeofencePage} />
          <Route path="/drivers" component={DriversPage} />
          <Route path="/driver/:id?" component={DriverPage} />
          <Route path="/calendars" component={CalendarsPage} />
          <Route path="/calendar/:id?" component={CalendarPage} />
          <Route path="/maintenances" component={MaintenancesPage} />
          <Route path="/maintenance/:id?" component={MaintenancePage} />
          <Route path="/commands" component={CommandsPage} />
          <Route path="/command/:id?" component={CommandPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/notification/:id?" component={NotificationPage} />
          <Route path="/attributes" component={ComputedAttributesPage} />
          <Route path="/attribute/:id?" component={ComputedAttributePage} />
        </Route>
        
        <Route path="/reports" component={ReportsLayout}>
          <Route path="/" component={RouteReportPage} />
          <Route path="/route" component={RouteReportPage} />
          <Route path="/trips" component={TripReportPage} />
          <Route path="/stops" component={StopReportPage} />
          <Route path="/summary" component={SummaryReportPage} />
          <Route path="/events" component={EventReportPage} />
          <Route path="/chart" component={ChartReportPage} />
          <Route path="/statistics" component={StatisticsPage} />
        </Route>
      </Route>
    </Router>
  </LocalizationProvider>
), root);
