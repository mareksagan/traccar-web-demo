# Traccar Web Demo

An (almost) fully functional mock backend for Traccar Web that simulates all API endpoints and WebSocket real-time updates. This allows you to develop and demo the frontend without running the Java backend.

## Features

- ✅ All REST API endpoints (CRUD for devices, users, geofences, etc.)
- ✅ WebSocket real-time updates (positions, events)
- ✅ Session-based authentication with cookies
- ✅ Simulated device movement
- ✅ All report types (route, trips, stops, summary)
- ✅ Statistics and audit logs
- ✅ Command sending simulation

## Video

[Watch the video](https://raw.githubusercontent.com/mareksagan/traccar-web-demo/refs/heads/demo/demo/TraccarWebDemo.mp4)

## Quick Start

### Option 1: Run Frontend + Mock Server Together

```bash
npm install
npm run start:mock
```

This starts both the mock server (port 8082) and the Vite dev server (port 3000).

### Option 2: Run Separately

Terminal 1 - Mock Server:
```bash
npm run mock-server
```

Terminal 2 - Frontend:
```bash
npm start
```

## Demo Credentials

- **Email:** `admin@example.com`
- **Password:** `admin`

## Mock Data

### Devices (6 pre-configured)
- Toyota Camry (online, car)
- Ford F-150 (online, truck)
- BMW Motorcycle (offline, motorcycle)
- Delivery Van 1 & 2 (online, vans)
- Personal SUV (offline, SUV)

### Groups (3)
- Personal Vehicles
- Motorcycles
- Fleet Vehicles

### Geofences (3)
- Headquarters (circle)
- Warehouse Zone (polygon)
- Restricted Area (circle)

### Drivers (3)
- John Doe, Jane Smith, Mike Johnson

## Real-Time Simulation

The mock server simulates real-time behavior:

1. **Position Updates** - Every 5 seconds, all online devices get new positions with simulated movement
2. **Events** - Every 30 seconds, random events are generated (overspeed, geofence enter/exit, ignition)
3. **Status Changes** - Device statuses update automatically

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/session` | Check current session |
| POST | `/api/session` | Login (form data: email, password) |
| DELETE | `/api/session` | Logout |
| POST | `/api/session/token` | Generate auth token |

### Server
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/server` | Server configuration |
| GET | `/api/server/geocode` | Reverse geocoding |

### Devices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List devices (supports pagination, search) |
| POST | `/api/devices` | Create device |
| PUT | `/api/devices/:id` | Update device |
| DELETE | `/api/devices/:id` | Delete device |
| GET | `/api/devices/:id/accumulators` | Get device accumulators |
| PUT | `/api/devices/:id/accumulators` | Update accumulators |

### Positions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/positions` | Get positions (latest or historical) |
| GET | `/api/positions/kml` | Export as KML |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/groups` | List/Create |
| PUT/DELETE | `/api/groups/:id` | Update/Delete |

### Geofences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/geofences` | List/Create |
| PUT/DELETE | `/api/geofences/:id` | Update/Delete |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/drivers` | List/Create |
| PUT/DELETE | `/api/drivers/:id` | Update/Delete |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/maintenance` | List/Create |
| PUT/DELETE | `/api/maintenance/:id` | Update/Delete |

### Calendars
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/calendars` | List/Create |
| PUT/DELETE | `/api/calendars/:id` | Update/Delete |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/users` | List/Create (POST allows registration) |
| PUT/DELETE | `/api/users/:id` | Update/Delete |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/notifications` | List/Create |
| PUT/DELETE | `/api/notifications/:id` | Update/Delete |

### Commands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/commands` | List/Create |
| POST | `/api/commands/send` | Send command to device |

### Computed Attributes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/attributes/computed` | List/Create |
| PUT/DELETE | `/api/attributes/computed/:id` | Update/Delete |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/route` | Route report |
| GET | `/api/reports/trips` | Trips report |
| GET | `/api/reports/stops` | Stops report |
| GET | `/api/reports/summary` | Summary report |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events |
| GET | `/api/events/:id` | Get single event |

### Statistics & Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/statistics` | Server statistics |
| GET | `/api/audit` | Audit log |
| GET | `/api/logs` | Server logs |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8082/api/socket` | Real-time updates |

## Customization

### Adding More Devices

Edit `mock-server.js` and add to the `db.devices` array:

```javascript
{ 
  id: 7, 
  name: 'New Vehicle', 
  uniqueId: 'NEW007', 
  status: 'online', 
  lastUpdate: new Date().toISOString(),
  groupId: 1,
  category: 'car',
  // ... other fields
}
```

### Changing Update Frequency

Modify the intervals at the bottom of `mock-server.js`:

```javascript
// Position updates (default: 5000ms)
setInterval(() => { ... }, 5000);

// Events (default: 30000ms)
setInterval(() => { ... }, 30000);
```

### Simulating Specific Scenarios

The mock server includes realistic data. You can:
- Modify device positions to simulate routes
- Add geofences to trigger enter/exit events
- Create maintenance schedules
- Generate specific event types

## Limitations

Compared to the real Traccar backend:

- No actual GPS device connections
- No email/SMS sending (just logs)
- No persistent database (data resets on restart)
- Simplified geocoding (just returns formatted string)
- No actual command execution on devices

## Troubleshooting

### Port already in use
Change the port in `mock-server.js`:
```javascript
const PORT = process.env.PORT || 8082;
```

Or set environment variable:
```bash
PORT=8083 npm run mock-server
```

### CORS errors
The mock server already enables CORS. If you have issues, check that the frontend is proxying to the correct port in `vite.config.js`.

### WebSocket not connecting
Ensure you're using the correct protocol:
- Development: `ws://localhost:8082`
- HTTPS: `wss://` (requires SSL setup)
