import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/socket' });

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Mock Database
const db = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@admin.com',
      password: 'admin',
      administrator: true,
      readonly: false,
      deviceReadonly: false,
      map: null,
      latitude: 0,
      longitude: 0,
      zoom: 0,
      twelveHourFormat: false,
      attributes: {},
      coordinateFormat: null,
      disabled: false,
      expirationTime: null,
      deviceLimit: -1,
      userLimit: 0,
      deviceReadonlyExpiration: null,
      token: null,
    },
  ],
  devices: [
    { id: 1, name: 'Toyota Camry', uniqueId: 'TOY001', status: 'online', lastUpdate: new Date().toISOString(), groupId: 1, phone: '+1234567890', model: 'Camry 2023', contact: 'John Doe', category: 'car', disabled: false, attributes: {} },
    { id: 2, name: 'Ford F-150', uniqueId: 'FORD002', status: 'online', lastUpdate: new Date().toISOString(), groupId: 1, phone: '+1234567891', model: 'F-150', contact: 'Jane Smith', category: 'truck', disabled: false, attributes: {} },
    { id: 3, name: 'BMW Motorcycle', uniqueId: 'BMW003', status: 'offline', lastUpdate: new Date(Date.now() - 3600000).toISOString(), groupId: 2, phone: null, model: 'R 1250 GS', contact: null, category: 'motorcycle', disabled: false, attributes: {} },
    { id: 4, name: 'Delivery Van 1', uniqueId: 'VAN001', status: 'online', lastUpdate: new Date().toISOString(), groupId: 3, phone: '+1234567892', model: 'Sprinter', contact: 'Mike Johnson', category: 'van', disabled: false, attributes: {} },
    { id: 5, name: 'Delivery Van 2', uniqueId: 'VAN002', status: 'online', lastUpdate: new Date().toISOString(), groupId: 3, phone: '+1234567893', model: 'Transit', contact: 'Sarah Wilson', category: 'van', disabled: false, attributes: {} },
    { id: 6, name: 'Personal SUV', uniqueId: 'SUV001', status: 'offline', lastUpdate: new Date(Date.now() - 7200000).toISOString(), groupId: null, phone: null, model: 'Highlander', contact: null, category: 'suv', disabled: false, attributes: {} },
  ],
  groups: [
    { id: 1, name: 'Personal Vehicles', groupId: null, attributes: {} },
    { id: 2, name: 'Motorcycles', groupId: null, attributes: {} },
    { id: 3, name: 'Fleet Vehicles', groupId: null, attributes: {} },
  ],
  geofences: [
    { id: 1, name: 'Headquarters', description: 'Main office area', area: 'CIRCLE(47.0105 28.8638 500)', attributes: { color: '#FF0000', hide: false } },
    { id: 2, name: 'Warehouse Zone', description: 'Storage facility', area: 'POLYGON((47.0160 28.8560, 47.0160 28.8710, 47.0060 28.8710, 47.0060 28.8560, 47.0160 28.8560))', attributes: { color: '#00FF00', hide: false } },
    { id: 3, name: 'Restricted Area', description: 'No entry zone', area: 'CIRCLE(47.0010 28.8500 300)', attributes: { color: '#FF0000', hide: false } },
  ],
  drivers: [
    { id: 1, name: 'John Doe', uniqueId: 'DRV001', attributes: {} },
    { id: 2, name: 'Jane Smith', uniqueId: 'DRV002', attributes: {} },
    { id: 3, name: 'Mike Johnson', uniqueId: 'DRV003', attributes: {} },
  ],
  maintenances: [
    { id: 1, name: 'Oil Change Toyota', type: 'maintenance', start: 5000, period: 5000, attributes: {} },
    { id: 2, name: 'Tire Rotation Ford', type: 'maintenance', start: 8000, period: 8000, attributes: {} },
  ],
  calendars: [
    { id: 1, name: 'Work Schedule', data: 'QkVHSU46VkNBTEVOREFSDQpWRVJTSU9OOjIuMA0KQkVHSU46VkVWRU5UDQpVSUQ6dGVzdEB0cmFjY2FyLm9yZw0KRFRTVEFSVDoyMDI0MDEwMVQwMDAwMA0KRFRFTkQ6MjAyNDAxMDFUMDEwMDANClJTVUxFOkZSRUc9REFJTFkNClNVTU1BUlk6V29yayBTY2hlZHVsZQ0KRU5EOlZFVkVOVA0KRU5EOlZDQUxFTkRBUg==', attributes: {} },
  ],
  notifications: [
    { id: 1, description: 'Geofence Alert', type: 'geofenceEnter', always: false, calendarId: null, attributes: { alarms: 'sos' }, notificators: 'web' },
    { id: 2, description: 'Overspeed Alert', type: 'deviceOverspeed', always: true, calendarId: null, attributes: { alarms: 'overspeed', speed: 80 }, notificators: 'web,mail' },
  ],
  commands: [
    { id: 1, deviceId: 1, type: 'custom', description: 'Engine Stop', attributes: { data: 'stop' } },
    { id: 2, deviceId: 1, type: 'custom', description: 'Engine Resume', attributes: { data: 'resume' } },
  ],
  computedAttributes: [
    { id: 1, description: 'Speed Check', type: 'boolean', expression: 'speed > 80', attribute: 'overspeed', attributes: {} },
  ],
  positions: {}, // deviceId -> positions array
  events: [],
  session: new Map(), // token -> user mapping
};

// Generate initial positions for devices
const generatePosition = (deviceId, offset = 0) => {
  const baseLat = 47.0105;  // Chisinau, Moldova
  const baseLon = 28.8638;
  const time = new Date(Date.now() - offset * 1000);
  return {
    id: Math.floor(Math.random() * 1000000),
    deviceId,
    protocol: 'gt06',
    serverTime: time.toISOString(),
    deviceTime: time.toISOString(),
    fixTime: time.toISOString(),
    outdated: false,
    valid: true,
    latitude: baseLat + (Math.random() - 0.5) * 0.1,
    longitude: baseLon + (Math.random() - 0.5) * 0.1,
    altitude: 10 + Math.random() * 100,
    speed: Math.random() * 100,
    course: Math.random() * 360,
    address: `bd. Stefan cel Mare ${Math.floor(Math.random() * 200)}, Chisinau, Moldova`,
    accuracy: 10,
    network: null,
    attributes: {
      batteryLevel: Math.floor(20 + Math.random() * 80),
      ignition: Math.random() > 0.3,
      distance: Math.floor(Math.random() * 10000),
      totalDistance: Math.floor(Math.random() * 100000),
      motion: Math.random() > 0.2,
      hours: Math.floor(Math.random() * 1000),
    },
  };
};

// Initialize positions for each device
db.devices.forEach(device => {
  db.positions[device.id] = generatePosition(device.id);
});

// Helper functions
const generateId = () => Math.floor(Math.random() * 1000000);
const generateToken = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const sessionToken = req.cookies.session;
  const user = db.session.get(sessionToken);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// ============ SESSION ENDPOINTS ============

// Get current session
app.get('/api/session', (req, res) => {
  const sessionToken = req.cookies.session;
  const user = db.session.get(sessionToken);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    // Ensure all required fields exist
    if (!userWithoutPassword.attributes) userWithoutPassword.attributes = {};
    res.json(userWithoutPassword);
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Login
app.post('/api/session', (req, res) => {
  const { email, password, code } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = generateToken();
    db.session.set(token, user);
    res.cookie('session', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    const { password, ...userWithoutPassword } = user;
    // Ensure all required fields exist
    if (!userWithoutPassword.attributes) userWithoutPassword.attributes = {};
    res.json(userWithoutPassword);
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Login with token
app.get('/api/session', (req, res) => {
  const { token } = req.query;
  if (token) {
    // For demo, just return first user
    const user = db.users[0];
    const sessionToken = generateToken();
    db.session.set(sessionToken, user);
    res.cookie('session', sessionToken, { httpOnly: true });
    const { password, ...userWithoutPassword } = user;
    // Ensure all required fields exist
    if (!userWithoutPassword.attributes) userWithoutPassword.attributes = {};
    res.json(userWithoutPassword);
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Logout
app.delete('/api/session', (req, res) => {
  const sessionToken = req.cookies.session;
  db.session.delete(sessionToken);
  res.clearCookie('session');
  res.status(204).send();
});

// Generate session token
app.post('/api/session/token', authMiddleware, (req, res) => {
  const token = generateToken();
  res.send(token);
});

// OpenID auth (redirect)
app.get('/api/session/openid/auth', (req, res) => {
  res.redirect('/?openid=success');
});

// ============ SERVER ENDPOINTS ============

app.get('/api/server', (req, res) => {
  res.json({
    id: 1,
    registration: true,
    readonly: false,
    deviceReadonly: false,
    map: null,
    bingKey: null,
    mapUrl: null,
    poiLayer: null,
    latitude: 0,
    longitude: 0,
    zoom: 0,
    twelveHourFormat: false,
    version: '6.0.0',
    forceSettings: false,
    coordinateFormat: null,
    limitCommands: false,
    snapToRoads: false,
    mapOnSelect: false,
    newServer: false,
    openIdEnabled: false,
    openIdForce: false,
    emailEnabled: true,
    geocoderEnabled: true,
    announcement: null,
    attributes: {
      'mail.smtp.host': 'smtp.example.com',
      'mail.smtp.port': '587',
    },
  });
});

// Geocode
app.get('/api/server/geocode', authMiddleware, (req, res) => {
  const { latitude, longitude } = req.query;
  res.send(`${latitude}, ${longitude} - bd. Stefan cel Mare, Chisinau, Moldova`);
});

// Update server settings
app.put('/api/server', authMiddleware, (req, res) => {
  res.json({ ...req.body, id: 1 });
});

// ============ DEVICE ENDPOINTS ============

app.get('/api/devices', authMiddleware, (req, res) => {
  const { all, userId, groupId, uniqueId, limit, offset, keyword, excludeAttributes } = req.query;
  
  let devices = [...db.devices];
  
  if (keyword) {
    devices = devices.filter(d => 
      d.name.toLowerCase().includes(keyword.toLowerCase()) ||
      d.uniqueId.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  if (groupId) {
    devices = devices.filter(d => d.groupId === parseInt(groupId));
  }
  
  if (uniqueId) {
    devices = devices.filter(d => d.uniqueId === uniqueId);
  }
  
  if (excludeAttributes === 'true') {
    devices = devices.map(d => {
      const { attributes, ...rest } = d;
      return rest;
    });
  }
  
  const start = parseInt(offset) || 0;
  const end = start + (parseInt(limit) || devices.length);
  
  res.json(devices.slice(start, end));
});

app.post('/api/devices', authMiddleware, (req, res) => {
  const device = { ...req.body, id: generateId() };
  db.devices.push(device);
  db.positions[device.id] = generatePosition(device.id);
  res.json(device);
});

app.get('/api/devices/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const device = db.devices.find(d => d.id === id);
  if (device) {
    res.json(device);
  } else {
    res.status(404).send('Device not found');
  }
});

app.put('/api/devices/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.devices.findIndex(d => d.id === id);
  if (index >= 0) {
    db.devices[index] = { ...db.devices[index], ...req.body, id };
    res.json(db.devices[index]);
  } else {
    res.status(404).send('Device not found');
  }
});

app.delete('/api/devices/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.devices = db.devices.filter(d => d.id !== id);
  delete db.positions[id];
  res.status(204).send();
});

// ============ POSITION ENDPOINTS ============

app.get('/api/positions', authMiddleware, (req, res) => {
  const { deviceId, from, to, id } = req.query;
  
  if (id) {
    const allPositions = Object.values(db.positions).flat();
    const position = allPositions.find(p => p.id === parseInt(id));
    return position ? res.json(position) : res.status(404).send();
  }
  
  if (deviceId && from && to) {
    // Return historical positions
    const positions = [];
    const count = 50;
    for (let i = 0; i < count; i++) {
      positions.push(generatePosition(parseInt(deviceId), i * 60));
    }
    return res.json(positions);
  }
  
  // Return latest positions for all devices
  const positions = db.devices.map(d => db.positions[d.id]).filter(Boolean);
  res.json(positions);
});

// KML Export - MUST come before /api/positions/:id
app.get('/api/positions/kml', (req, res) => {
  console.log('>>> KML endpoint hit! URL:', req.originalUrl, 'Query:', req.query);
  
  const { deviceId, from, to } = req.query;
  
  // Check session
  const sessionToken = req.cookies?.session;
  const user = sessionToken ? db.session.get(sessionToken) : null;
  
  if (!user) {
    console.log('KML export: No valid session, returning 401');
    return res.status(401).json({ error: 'Unauthorized', session: sessionToken ? 'invalid' : 'missing' });
  }
  
  console.log(`KML export: deviceId=${deviceId}, from=${from}, to=${to}, user=${user.email}`);
  
  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required' });
  }
  
  const device = db.devices.find(d => d.id === parseInt(deviceId));
  const deviceName = device ? device.name : `Device_${deviceId}`;
  
  // Generate some realistic coordinates based on device
  const positions = [];
  const count = 20;
  const baseLat = 47.0105;
  const baseLon = 28.8638;
  for (let i = 0; i < count; i++) {
    positions.push(`${baseLon + i * 0.001},${baseLat + Math.sin(i * 0.1) * 0.005},0`);
  }
  
  res.set('Content-Type', 'application/vnd.google-earth.kml+xml');
  res.set('Content-Disposition', `attachment; filename="${deviceName}_track.kml"`);
  return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${deviceName} Track</name>
    <Placemark>
      <name>${deviceName} Route</name>
      <LineString>
        <coordinates>${positions.join(' ')}</coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`);
});

// Get single position - MUST come after specific routes like /kml
app.get('/api/positions/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const allPositions = Object.values(db.positions).flat();
  const position = allPositions.find(p => p.id === id);
  if (position) {
    res.json(position);
  } else {
    res.status(404).send();
  }
});

// ============ GROUP ENDPOINTS ============

app.get('/api/groups', authMiddleware, (req, res) => {
  res.json(db.groups);
});

app.post('/api/groups', authMiddleware, (req, res) => {
  const group = { ...req.body, id: generateId() };
  db.groups.push(group);
  res.json(group);
});

app.get('/api/groups/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const group = db.groups.find(g => g.id === id);
  if (group) {
    res.json(group);
  } else {
    res.status(404).send();
  }
});

app.put('/api/groups/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.groups.findIndex(g => g.id === id);
  if (index >= 0) {
    db.groups[index] = { ...db.groups[index], ...req.body, id };
    res.json(db.groups[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/groups/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.groups = db.groups.filter(g => g.id !== id);
  res.status(204).send();
});

// ============ GEOFENCE ENDPOINTS ============

app.get('/api/geofences', authMiddleware, (req, res) => {
  res.json(db.geofences);
});

app.post('/api/geofences', authMiddleware, (req, res) => {
  const geofence = { ...req.body, id: generateId(), attributes: req.body.attributes || {} };
  db.geofences.push(geofence);
  res.json(geofence);
});

app.get('/api/geofences/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const geofence = db.geofences.find(g => g.id === id);
  if (geofence) {
    // Ensure attributes always exists
    const result = { ...geofence, attributes: geofence.attributes || {} };
    res.json(result);
  } else {
    res.status(404).send();
  }
});

app.put('/api/geofences/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.geofences.findIndex(g => g.id === id);
  if (index >= 0) {
    db.geofences[index] = { ...db.geofences[index], ...req.body, id };
    // Ensure attributes always exists
    if (!db.geofences[index].attributes) {
      db.geofences[index].attributes = {};
    }
    res.json(db.geofences[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/geofences/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.geofences = db.geofences.filter(g => g.id !== id);
  res.status(204).send();
});

// ============ DRIVER ENDPOINTS ============

app.get('/api/drivers', authMiddleware, (req, res) => {
  res.json(db.drivers);
});

app.post('/api/drivers', authMiddleware, (req, res) => {
  const driver = { ...req.body, id: generateId() };
  db.drivers.push(driver);
  res.json(driver);
});

app.get('/api/drivers/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const driver = db.drivers.find(d => d.id === id);
  if (driver) {
    res.json(driver);
  } else {
    res.status(404).send();
  }
});

app.put('/api/drivers/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.drivers.findIndex(d => d.id === id);
  if (index >= 0) {
    db.drivers[index] = { ...db.drivers[index], ...req.body, id };
    res.json(db.drivers[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/drivers/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.drivers = db.drivers.filter(d => d.id !== id);
  res.status(204).send();
});

// ============ MAINTENANCE ENDPOINTS ============

app.get('/api/maintenance', authMiddleware, (req, res) => {
  res.json(db.maintenances);
});

app.post('/api/maintenance', authMiddleware, (req, res) => {
  const maintenance = { ...req.body, id: generateId() };
  db.maintenances.push(maintenance);
  res.json(maintenance);
});

app.get('/api/maintenance/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const maintenance = db.maintenances.find(m => m.id === id);
  if (maintenance) {
    res.json(maintenance);
  } else {
    res.status(404).send();
  }
});

app.put('/api/maintenance/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.maintenances.findIndex(m => m.id === id);
  if (index >= 0) {
    db.maintenances[index] = { ...db.maintenances[index], ...req.body, id };
    res.json(db.maintenances[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/maintenance/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.maintenances = db.maintenances.filter(m => m.id !== id);
  res.status(204).send();
});

// ============ CALENDAR ENDPOINTS ============

app.get('/api/calendars', authMiddleware, (req, res) => {
  res.json(db.calendars);
});

app.post('/api/calendars', authMiddleware, (req, res) => {
  const calendar = { ...req.body, id: generateId() };
  db.calendars.push(calendar);
  res.json(calendar);
});

app.get('/api/calendars/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const calendar = db.calendars.find(c => c.id === id);
  if (calendar) {
    res.json(calendar);
  } else {
    res.status(404).send();
  }
});

app.put('/api/calendars/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.calendars.findIndex(c => c.id === id);
  if (index >= 0) {
    db.calendars[index] = { ...db.calendars[index], ...req.body, id };
    res.json(db.calendars[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/calendars/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.calendars = db.calendars.filter(c => c.id !== id);
  res.status(204).send();
});

// ============ NOTIFICATION ENDPOINTS ============

// Specific routes MUST come before parameterized routes
app.get('/api/notifications/types', authMiddleware, (req, res) => {
  res.json([
    { type: 'deviceOnline', name: 'Device Online' },
    { type: 'deviceUnknown', name: 'Device Unknown' },
    { type: 'deviceOffline', name: 'Device Offline' },
    { type: 'geoFenceEnter', name: 'Geofence Enter' },
    { type: 'geoFenceExit', name: 'Geofence Exit' },
    { type: 'deviceOverspeed', name: 'Device Overspeed' },
    { type: 'deviceFuelDrop', name: 'Fuel Drop' },
    { type: 'deviceFuelIncrease', name: 'Fuel Increase' },
    { type: 'alarm', name: 'Alarm' },
    { type: 'ignitionOn', name: 'Ignition On' },
    { type: 'ignitionOff', name: 'Ignition Off' },
    { type: 'maintenance', name: 'Maintenance' },
    { type: 'textMessage', name: 'Text Message' },
    { type: 'driverChanged', name: 'Driver Changed' },
    { type: 'commandResult', name: 'Command Result' },
  ]);
});

app.get('/api/notifications/notificators', authMiddleware, (req, res) => {
  const { announcement } = req.query;
  if (announcement === 'true') {
    return res.json([
      { type: 'web', name: 'Web' },
      { type: 'mail', name: 'Email' },
    ]);
  }
  res.json([
    { type: 'web', name: 'Web' },
    { type: 'mail', name: 'Email' },
    { type: 'sms', name: 'SMS' },
    { type: 'firebase', name: 'Firebase' },
  ]);
});

app.post('/api/notifications/test', authMiddleware, (req, res) => {
  console.log('Test notification:', req.body);
  res.status(204).send();
});

app.post('/api/notifications/test/:notificator', authMiddleware, (req, res) => {
  res.status(204).send();
});

app.post('/api/notifications/send/:notificator', authMiddleware, (req, res) => {
  res.status(204).send();
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json(db.notifications);
});

app.post('/api/notifications', authMiddleware, (req, res) => {
  const notification = { ...req.body, id: generateId() };
  db.notifications.push(notification);
  res.json(notification);
});

app.get('/api/notifications/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const notification = db.notifications.find(n => n.id === id);
  if (notification) {
    res.json(notification);
  } else {
    res.status(404).send();
  }
});

app.put('/api/notifications/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.notifications.findIndex(n => n.id === id);
  if (index >= 0) {
    db.notifications[index] = { ...db.notifications[index], ...req.body, id };
    res.json(db.notifications[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/notifications/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.notifications = db.notifications.filter(n => n.id !== id);
  res.status(204).send();
});

// ============ USER ENDPOINTS ============

app.get('/api/users', authMiddleware, (req, res) => {
  const users = db.users.map(u => {
    const { password, ...withoutPassword } = u;
    return withoutPassword;
  });
  res.json(users);
});

app.post('/api/users', (req, res) => {
  // Allow registration without auth
  const user = { 
    ...req.body, 
    id: generateId(),
    administrator: false,
    readonly: false,
    deviceReadonly: false,
    map: null,
    latitude: 0,
    longitude: 0,
    zoom: 0,
    twelveHourFormat: false,
    coordinateFormat: null,
    attributes: {},
  };
  db.users.push(user);
  const { password, ...withoutPassword } = user;
  res.json(withoutPassword);
});

app.put('/api/users/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.users.findIndex(u => u.id === id);
  if (index >= 0) {
    db.users[index] = { ...db.users[index], ...req.body, id };
    const { password, ...withoutPassword } = db.users[index];
    res.json(withoutPassword);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/users/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.users = db.users.filter(u => u.id !== id);
  res.status(204).send();
});

// ============ COMMAND ENDPOINTS ============

// Specific routes MUST come before parameterized routes
app.get('/api/commands/types', authMiddleware, (req, res) => {
  res.json([
    { type: 'custom', name: 'Custom' },
    { type: 'positionPeriodic', name: 'Position Periodic' },
    { type: 'positionStop', name: 'Position Stop' },
    { type: 'engineStop', name: 'Engine Stop' },
    { type: 'engineResume', name: 'Engine Resume' },
    { type: 'alarmArm', name: 'Alarm Arm' },
    { type: 'alarmDisarm', name: 'Alarm Disarm' },
    { type: 'setTimezone', name: 'Set Timezone' },
    { type: 'requestPhoto', name: 'Request Photo' },
    { type: 'rebootDevice', name: 'Reboot Device' },
    { type: 'sendSms', name: 'Send SMS' },
    { type: 'sendUssd', name: 'Send USSD' },
    { type: 'sosNumber', name: 'SOS Number' },
    { type: 'silenceSos', name: 'Silence SOS' },
    { type: 'setIndicator', name: 'Set Indicator' },
    { type: 'configuration', name: 'Configuration' },
    { type: 'getVersion', name: 'Get Version' },
    { type: 'firmwareUpdate', name: 'Firmware Update' },
    { type: 'setConnection', name: 'Set Connection' },
    { type: 'setOdometer', name: 'Set Odometer' },
  ]);
});

app.post('/api/commands/send', authMiddleware, (req, res) => {
  // Simulate sending command to device
  console.log('Command sent:', req.body);
  res.status(204).send();
});

app.get('/api/commands/send', authMiddleware, (req, res) => {
  const { deviceId } = req.query;
  // Return available commands for the device
  res.json([
    { type: 'engineStop', name: 'Engine Stop', deviceId: parseInt(deviceId) },
    { type: 'engineResume', name: 'Engine Resume', deviceId: parseInt(deviceId) },
    { type: 'rebootDevice', name: 'Reboot Device', deviceId: parseInt(deviceId) },
  ]);
});

app.get('/api/commands', authMiddleware, (req, res) => {
  const { deviceId } = req.query;
  if (deviceId) {
    return res.json(db.commands.filter(c => c.deviceId === parseInt(deviceId)));
  }
  res.json(db.commands);
});

app.post('/api/commands', authMiddleware, (req, res) => {
  const command = { ...req.body, id: generateId() };
  db.commands.push(command);
  res.json(command);
});

app.get('/api/commands/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const command = db.commands.find(c => c.id === id);
  if (command) {
    res.json(command);
  } else {
    res.status(404).send();
  }
});

// ============ COMPUTED ATTRIBUTES ENDPOINTS ============

app.get('/api/attributes/computed', authMiddleware, (req, res) => {
  res.json(db.computedAttributes);
});

app.post('/api/attributes/computed', authMiddleware, (req, res) => {
  const attr = { ...req.body, id: generateId() };
  db.computedAttributes.push(attr);
  res.json(attr);
});

app.get('/api/attributes/computed/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const attr = db.computedAttributes.find(a => a.id === id);
  if (attr) {
    res.json(attr);
  } else {
    res.status(404).send();
  }
});

app.put('/api/attributes/computed/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.computedAttributes.findIndex(a => a.id === id);
  if (index >= 0) {
    db.computedAttributes[index] = { ...db.computedAttributes[index], ...req.body, id };
    res.json(db.computedAttributes[index]);
  } else {
    res.status(404).send();
  }
});

app.delete('/api/attributes/computed/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  db.computedAttributes = db.computedAttributes.filter(a => a.id !== id);
  res.status(204).send();
});

// ============ EVENTS & REPORTS ============

app.get('/api/events', authMiddleware, (req, res) => {
  const { deviceId, from, to, type } = req.query;
  
  // Generate some mock events
  const events = [];
  const types = ['geofenceEnter', 'geofenceExit', 'deviceOverspeed', 'ignitionOn', 'ignitionOff'];
  
  for (let i = 0; i < 20; i++) {
    events.push({
      id: generateId(),
      deviceId: parseInt(deviceId) || db.devices[i % db.devices.length].id,
      type: type || types[i % types.length],
      eventTime: new Date(Date.now() - i * 3600000).toISOString(),
      positionId: generateId(),
      geofenceId: i % 3 + 1,
      maintenanceId: null,
      attributes: {
        message: `Event ${types[i % types.length]} triggered`,
        alarm: i % 5 === 0 ? 'sos' : null,
      },
    });
  }
  
  res.json(events);
});

app.get('/api/events/:id', authMiddleware, (req, res) => {
  const event = {
    id: parseInt(req.params.id),
    deviceId: 1,
    type: 'geofenceEnter',
    eventTime: new Date().toISOString(),
    positionId: generateId(),
    geofenceId: 1,
    attributes: { message: 'Device entered geofence' },
  };
  res.json(event);
});

// Reports
app.get('/api/reports/route', authMiddleware, (req, res) => {
  const positions = [];
  for (let i = 0; i < 50; i++) {
    positions.push(generatePosition(1, i * 60));
  }
  res.json(positions);
});

app.get('/api/reports/trips', authMiddleware, (req, res) => {
  const { deviceId, groupId } = req.query;
  
  // WORKAROUND: If no device/group selected, use first device to prevent frontend crash
  let targetDeviceId = deviceId ? parseInt(deviceId) : null;
  if (!targetDeviceId && groupId) {
    const groupDevices = db.devices.filter(d => d.groupId === parseInt(groupId));
    targetDeviceId = groupDevices[0]?.id;
  }
  if (!targetDeviceId) {
    targetDeviceId = db.devices[0]?.id || 1;
  }
  
  const trips = [{
    deviceId: targetDeviceId,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 3600000,
    distance: 45000,
    averageSpeed: 45,
    maxSpeed: 80,
    spentFuel: 5.2,
    startPositionId: generateId(),
    endPositionId: generateId(),
    startLat: 47.0105,
    startLon: 28.8638,
    endLat: 47.0210,
    endLon: 28.8770,
  }];
  res.json(trips);
});

app.get('/api/reports/stops', authMiddleware, (req, res) => {
  const stops = [{
    deviceId: 1,
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 3600000).toISOString(),
    duration: 3600000,
    latitude: 47.0105,
    longitude: 28.8638,
    positionId: generateId(),
    address: '123 Main St',
  }];
  res.json(stops);
});

app.get('/api/reports/summary', authMiddleware, (req, res) => {
  const summary = [{
    deviceId: 1,
    distance: 150000,
    averageSpeed: 45,
    maxSpeed: 120,
    spentFuel: 15.5,
    engineHours: 18000000,
  }];
  res.json(summary);
});

// ============ STATISTICS ============

app.get('/api/statistics', authMiddleware, (req, res) => {
  res.json([{
    captureTime: new Date().toISOString(),
    activeUsers: 5,
    activeDevices: db.devices.filter(d => d.status === 'online').length,
    requests: 1250,
    messagesReceived: 50000,
    messagesStored: 45000,
    mailSent: 120,
    smsSent: 0,
    geocoderRequests: 85,
    geolocationRequests: 45,
  }]);
});

// ============ AUDIT LOGS ============

app.get('/api/audit', authMiddleware, (req, res) => {
  const logs = [{
    id: generateId(),
    userId: 1,
    action: 'CREATE',
    entityType: 'device',
    entityId: 1,
    date: new Date().toISOString(),
    attributes: {},
  }, {
    id: generateId(),
    userId: 1,
    action: 'UPDATE',
    entityType: 'user',
    entityId: 1,
    date: new Date(Date.now() - 3600000).toISOString(),
    attributes: {},
  }];
  res.json(logs);
});

// ============ LOGS ============

app.get('/api/logs', authMiddleware, (req, res) => {
  const logs = [
    { timestamp: new Date().toISOString(), message: 'Device connected: Toyota Camry' },
    { timestamp: new Date(Date.now() - 60000).toISOString(), message: 'Position received from Ford F-150' },
    { timestamp: new Date(Date.now() - 120000).toISOString(), message: 'Geofence alert triggered' },
    { timestamp: new Date(Date.now() - 180000).toISOString(), message: 'User admin logged in' },
  ];
  res.json(logs);
});

// ============ ACCUMULATORS ============

app.get('/api/devices/:id/accumulators', authMiddleware, (req, res) => {
  res.json({
    deviceId: parseInt(req.params.id),
    totalDistance: 150000,
    hours: 3600000,
  });
});

app.put('/api/devices/:id/accumulators', authMiddleware, (req, res) => {
  res.status(204).send();
});

// ============ DEVICE COMMANDS ============

app.get('/api/devices/:id/commands', authMiddleware, (req, res) => {
  const deviceId = parseInt(req.params.id);
  res.json(db.commands.filter(c => c.deviceId === deviceId));
});

// ============ PERMISSIONS ============

app.get('/api/permissions', authMiddleware, (req, res) => {
  const { userId, deviceId, groupId, geofenceId, driverId, maintenanceId, calendarId, notificationId } = req.query;
  
  // Return mock permissions - all users have access to everything in demo
  const permissions = [];
  
  if (userId) {
    db.devices.forEach(d => permissions.push({ userId: parseInt(userId), deviceId: d.id }));
    db.groups.forEach(g => permissions.push({ userId: parseInt(userId), groupId: g.id }));
  }
  if (deviceId) {
    db.users.forEach(u => permissions.push({ userId: u.id, deviceId: parseInt(deviceId) }));
  }
  if (groupId) {
    db.users.forEach(u => permissions.push({ userId: u.id, groupId: parseInt(groupId) }));
  }
  if (geofenceId) {
    db.devices.forEach(d => permissions.push({ deviceId: d.id, geofenceId: parseInt(geofenceId) }));
  }
  if (driverId) {
    db.devices.forEach(d => permissions.push({ deviceId: d.id, driverId: parseInt(driverId) }));
  }
  if (maintenanceId) {
    db.devices.forEach(d => permissions.push({ deviceId: d.id, maintenanceId: parseInt(maintenanceId) }));
  }
  if (calendarId) {
    db.devices.forEach(d => permissions.push({ deviceId: d.id, calendarId: parseInt(calendarId) }));
  }
  if (notificationId) {
    db.users.forEach(u => permissions.push({ userId: u.id, notificationId: parseInt(notificationId) }));
  }
  
  res.json(permissions);
});

app.post('/api/permissions', authMiddleware, (req, res) => {
  res.status(204).send();
});

app.delete('/api/permissions', authMiddleware, (req, res) => {
  res.status(204).send();
});

// ============ GEOFENCE EXTRAS ============

app.get('/api/geofences/route', authMiddleware, (req, res) => {
  const { deviceId, from, to } = req.query;
  // Return empty geofence events for route
  res.json([]);
});

// ============ GROUP CONNECTIONS ============

app.get('/api/groups/:id/devices', authMiddleware, (req, res) => {
  const groupId = parseInt(req.params.id);
  res.json(db.devices.filter(d => d.groupId === groupId));
});

// ============ SERVER EXTRAS ============

app.get('/api/server/time', (req, res) => {
  res.json({ time: new Date().toISOString() });
});

// ============ IMPORT/EXPORT ============

app.post('/api/devices/import', authMiddleware, (req, res) => {
  // Simulate import
  res.status(204).send();
});

app.get('/api/devices/export', authMiddleware, (req, res) => {
  res.set('Content-Type', 'application/json');
  res.set('Content-Disposition', 'attachment; filename=devices.json');
  res.json(db.devices);
});

// ============ DEVICE STATUS ============

app.get('/api/devices/:id/status', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const device = db.devices.find(d => d.id === id);
  if (device) {
    res.json({
      deviceId: id,
      online: device.status === 'online',
      lastUpdate: device.lastUpdate,
    });
  } else {
    res.status(404).send();
  }
});

// ============ TRIP & STOP REPORTS ENHANCED ============

app.get('/api/reports/combined', authMiddleware, (req, res) => {
  const { deviceId, groupId, from, to } = req.query;
  
  let deviceIds = [];
  
  // Handle groupId - get all devices in the group
  if (groupId) {
    const parsedGroupId = parseInt(groupId);
    const groupDevices = db.devices.filter(d => d.groupId === parsedGroupId);
    deviceIds = groupDevices.map(d => d.id);
  }
  
  // Handle deviceId
  if (deviceId) {
    if (Array.isArray(deviceId)) {
      deviceIds = deviceId.map(id => parseInt(id));
    } else {
      deviceIds = [parseInt(deviceId)];
    }
  }
  
  // WORKAROUND: If no valid devices selected, return first device to prevent frontend crash
  if (deviceIds.length === 0) {
    deviceIds = [db.devices[0]?.id || 1];
  }
  
  // Generate combined reports for all devices
  const reports = deviceIds.map(id => {
    const device = db.devices.find(d => d.id === id);
    if (!device) return null;
    
    const positions = [];
    for (let i = 0; i < 20; i++) {
      positions.push(generatePosition(id, i * 60));
    }
    
    return {
      deviceId: id,
      deviceName: device.name,
      from,
      to,
      route: positions.map(p => [p.longitude, p.latitude]),
      positions: positions,
      events: [{
        id: generateId(),
        deviceId: id,
        type: 'geofenceEnter',
        eventTime: new Date().toISOString(),
        positionId: positions[5]?.id,
        geofenceId: 1,
      }, {
        id: generateId(),
        deviceId: id,
        type: 'geofenceExit',
        eventTime: new Date(Date.now() + 60000).toISOString(),
        positionId: positions[15]?.id,
        geofenceId: 1,
      }],
      trips: [{
        startTime: positions[0]?.deviceTime,
        endTime: positions[9]?.deviceTime,
        distance: 5000,
        averageSpeed: 45,
      }],
      stops: [{
        startTime: positions[10]?.deviceTime,
        endTime: positions[12]?.deviceTime,
        duration: 120000,
        latitude: positions[11]?.latitude,
        longitude: positions[11]?.longitude,
      }],
    };
  }).filter(Boolean);
  
  res.json(reports);
});

// ============ CHART REPORT ============

app.get('/api/reports/chart', authMiddleware, (req, res) => {
  const { deviceId, from, to, type } = req.query;
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      deviceId: parseInt(deviceId),
      date: new Date(Date.now() - i * 3600000).toISOString(),
      value: Math.random() * 100,
    });
  }
  res.json(data);
});

// ============ GEOFENCE REPORT ============

app.get('/api/reports/geofences', authMiddleware, (req, res) => {
  const { deviceId, groupId } = req.query;
  
  // WORKAROUND: If no device/group selected, use first device to prevent frontend crash
  let targetDeviceId = deviceId ? parseInt(deviceId) : null;
  if (!targetDeviceId && groupId) {
    const groupDevices = db.devices.filter(d => d.groupId === parseInt(groupId));
    targetDeviceId = groupDevices[0]?.id;
  }
  if (!targetDeviceId) {
    targetDeviceId = db.devices[0]?.id || 1;
  }
  
  res.json([{
    deviceId: targetDeviceId,
    geofenceId: 1,
    enterTime: new Date(Date.now() - 3600000).toISOString(),
    exitTime: new Date(Date.now() - 1800000).toISOString(),
    duration: 1800000,
    geofenceName: 'Headquarters',
  }]);
});

// ============ EVENT REPORT ============

app.get('/api/reports/events', authMiddleware, (req, res) => {
  const { deviceId, from, to } = req.query;
  const events = [];
  const types = ['geofenceEnter', 'geofenceExit', 'deviceOverspeed', 'ignitionOn', 'ignitionOff'];
  for (let i = 0; i < 10; i++) {
    events.push({
      id: generateId(),
      deviceId: parseInt(deviceId) || db.devices[i % db.devices.length].id,
      type: types[i % types.length],
      eventTime: new Date(Date.now() - i * 3600000).toISOString(),
      positionId: generateId(),
      geofenceId: i % 3 + 1,
      attributes: { message: `Event: ${types[i % types.length]}` },
    });
  }
  res.json(events);
});

// ============ STATISTICS REPORTS ============

app.get('/api/reports/statistics', authMiddleware, (req, res) => {
  const { from, to } = req.query;
  res.json([{
    captureTime: new Date().toISOString(),
    activeUsers: 5,
    activeDevices: db.devices.filter(d => d.status === 'online').length,
    requests: 1250,
    messagesReceived: 50000,
    messagesStored: 45000,
    mailSent: 120,
    smsSent: 0,
    geocoderRequests: 85,
    geolocationRequests: 45,
  }]);
});

// ============ SCHEDULED REPORTS ============

app.get('/api/reports/scheduled', authMiddleware, (req, res) => {
  res.json([{
    id: 1,
    description: 'Daily Report',
    type: 'summary',
    devices: [1, 2, 3],
    geofences: [],
    users: [1],
    mail: true,
    attributes: {},
  }]);
});

app.post('/api/reports/scheduled', authMiddleware, (req, res) => {
  const report = { ...req.body, id: generateId() };
  res.json(report);
});

app.put('/api/reports/scheduled/:id', authMiddleware, (req, res) => {
  res.json({ ...req.body, id: parseInt(req.params.id) });
});

app.delete('/api/reports/scheduled/:id', authMiddleware, (req, res) => {
  res.status(204).send();
});

// ============ ANNOUNCEMENTS ============

app.get('/api/announcements', authMiddleware, (req, res) => {
  res.json([]);
});

app.post('/api/announcements', authMiddleware, (req, res) => {
  const announcement = { ...req.body, id: generateId() };
  res.json(announcement);
});

// ============ DEVICE MEDIA ============

app.get('/api/media/:deviceId', authMiddleware, (req, res) => {
  res.json([]);
});

// ============ PASSWORD RESET ============

app.post('/api/password/reset', (req, res) => {
  res.status(204).send();
});

app.post('/api/password/update', (req, res) => {
  res.status(204).send();
});

// ============ TOTP ============

app.post('/api/users/totp', (req, res) => {
  res.json({ qrUrl: 'otpauth://totp/Traccar:admin?secret=JBSWY3DPEHPK3PXP&issuer=Traccar' });
});

// ============ PERMISSIONS BULK ============

app.post('/api/permissions/bulk', authMiddleware, (req, res) => {
  res.status(204).send();
});

// ============ SHARE ============

app.post('/api/share/:type', authMiddleware, (req, res) => {
  res.json({ token: generateToken() });
});

// ============ SERVER EXTRAS ============

app.get('/api/server/timezones', authMiddleware, (req, res) => {
  res.json([
    { id: 'UTC', name: 'UTC' },
    { id: 'America/New_York', name: 'America/New_York' },
    { id: 'America/Los_Angeles', name: 'America/Los_Angeles' },
    { id: 'Europe/London', name: 'Europe/London' },
    { id: 'Europe/Paris', name: 'Europe/Paris' },
    { id: 'Asia/Tokyo', name: 'Asia/Tokyo' },
  ]);
});

app.post('/api/server/file/:name', authMiddleware, (req, res) => {
  res.json({ url: `/api/media/${req.params.name}` });
});

app.post('/api/server/reboot', authMiddleware, (req, res) => {
  res.status(204).send();
});

// ============ SESSION MANAGEMENT ============

app.delete('/api/session/:userId', authMiddleware, (req, res) => {
  res.status(204).send();
});

app.post('/api/session/token/revoke', authMiddleware, (req, res) => {
  res.status(204).send();
});

// ============ DEVICE IMAGE ============

app.get('/api/devices/:id/image', authMiddleware, (req, res) => {
  res.status(404).send(); // No images in mock
});

app.post('/api/devices/:id/image', authMiddleware, (req, res) => {
  res.json({ url: `/api/media/device_${req.params.id}_image.jpg` });
});

// ============ POSITION CSV EXPORT ============

app.get('/api/positions/csv', authMiddleware, (req, res) => {
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename=positions.csv');
  res.send('fixTime,latitude,longitude,speed,course,address\n2024-01-01T00:00:00Z,47.0105,28.8638,50,90,"Chisinau"');
});

// ============ MEDIA ACCESS ============

app.get('/api/media/:deviceUniqueId/:fileName', authMiddleware, (req, res) => {
  res.status(404).send(); // No media files in mock
});

// ============ COMPUTED ATTRIBUTE TEST ============

app.get('/api/attributes/computed/test', authMiddleware, (req, res) => {
  const { expression } = req.query;
  // Return mock test result
  res.json({
    success: true,
    result: true,
    position: generatePosition(1),
  });
});

// ============ REPORTS LIST (SCHEDULED) ============

app.get('/api/reports', authMiddleware, (req, res) => {
  res.json([{
    id: 1,
    description: 'Daily Device Report',
    type: 'summary',
    calendarId: 1,
    devices: [1, 2, 3],
    groups: [],
    geofences: [],
    users: [1],
    mail: true,
    attributes: {},
  }]);
});

// ============ FALLBACK FOR UNDEFINED ROUTES ============

app.use('/api/*', (req, res) => {
  console.log(`Mock: Unhandled ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not implemented in mock', path: req.originalUrl, method: req.method });
});

// ============ WEBSOCKET ============

const clients = new Set();

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');
  clients.add(ws);
  
  let includeLogs = false;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.logs !== undefined) {
        includeLogs = data.logs;
      }
    } catch (e) {
      // Heartbeat or empty message
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
  
  // Send initial data
  ws.send(JSON.stringify({
    devices: db.devices,
    positions: Object.values(db.positions),
  }));
});

// Simulate real-time updates
setInterval(() => {
  // Update device positions (simulate movement)
  db.devices.forEach(device => {
    if (device.status === 'online') {
      const currentPos = db.positions[device.id];
      if (currentPos) {
        // Small random movement
        currentPos.latitude += (Math.random() - 0.5) * 0.001;
        currentPos.longitude += (Math.random() - 0.5) * 0.001;
        currentPos.speed = Math.random() * 80;
        currentPos.course = (currentPos.course + Math.random() * 10 - 5) % 360;
        currentPos.fixTime = new Date().toISOString();
        currentPos.deviceTime = new Date().toISOString();
        currentPos.serverTime = new Date().toISOString();
        currentPos.attributes.motion = currentPos.speed > 5;
        currentPos.attributes.ignition = Math.random() > 0.2;
      }
    }
  });
  
  // Broadcast to all connected clients
  const update = JSON.stringify({
    devices: db.devices,
    positions: Object.values(db.positions),
  });
  
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(update);
    }
  });
}, 5000); // Update every 5 seconds

// Occasionally send events
setInterval(() => {
  const eventTypes = ['deviceOverspeed', 'geofenceEnter', 'ignitionOn', 'ignitionOff'];
  const event = {
    events: [{
      id: generateId(),
      deviceId: db.devices[Math.floor(Math.random() * db.devices.length)].id,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      eventTime: new Date().toISOString(),
      positionId: generateId(),
      attributes: {
        message: 'Real-time event triggered',
      },
    }],
  };
  
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(event));
    }
  });
}, 30000); // Event every 30 seconds

// ============ START SERVER ============

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log(`🚀 Traccar Mock Server running on port ${PORT}`);
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin');
  console.log('');
  console.log('API endpoints:');
  console.log('  GET  /api/server       - Server info');
  console.log('  GET  /api/session      - Check session');
  console.log('  POST /api/session      - Login');
  console.log('  GET  /api/devices      - List devices');
  console.log('  GET  /api/positions    - Get positions');
  console.log('  WS   /api/socket       - WebSocket stream');
  console.log('');
});
