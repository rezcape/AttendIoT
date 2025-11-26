import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/contexts/SocketContext';

interface DetectedDevice {
  id: string;
  studentName: string;
  studentId: string;
  time: string;
  rssi: number;
}

export default function LiveMonitor() {
  const { socket, isConnected } = useSocket();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const [sessionTime, setSessionTime] = useState(0);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDeviceDetected = (data: any) => {
        if (!isScanning) return;
        
        // Data might come in different structures depending on the MQTT payload
        // Assuming payload has 'devices' array or single device info
        // backend/mqtt/mqttHandler.js emits 'device-detected' with the whole payload
        
        console.log("Device detected:", data);

        // Adapt this based on your actual MQTT payload structure
        // For now, let's assume data.devices is an array of { mac, rssi } 
        // and we need to map it to our display format.
        // Since the backend might not send student name immediately in the raw scan event
        // we might display MAC address or 'Unknown' if name isn't resolved yet.
        // OR: The backend 'attendance-update' event emits the fully resolved record.
        // Let's listen to 'attendance-update' for confirmed students.
    };
    
    const handleAttendanceUpdate = (record: any) => {
        if (!isScanning) return;

        const newDevice: DetectedDevice = {
            id: record._id || Date.now().toString(),
            studentName: record.studentId?.name || 'Unknown Student',
            studentId: record.studentId?.studentId || 'N/A',
            time: new Date().toLocaleTimeString(),
            rssi: record.rssi || 0
        };

        setDevices(prev => [newDevice, ...prev].slice(0, 50)); // Keep last 50
    };

    socket.on('device-detected', handleDeviceDetected);
    socket.on('attendance-update', handleAttendanceUpdate);

    return () => {
      socket.off('device-detected', handleDeviceDetected);
      socket.off('attendance-update', handleAttendanceUpdate);
    };
  }, [socket, isScanning]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
        setDevices([]); // Clear previous session
        setSessionTime(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Monitor</h1>
          <p className="text-muted-foreground mt-2">Real-time attendance detection.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
             <span className="text-sm text-muted-foreground">
              {isConnected ? 'Socket Connected' : 'Socket Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isScanning ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isScanning ? 'Scanning' : 'Stopped'}
            </span>
          </div>
          <Button onClick={toggleScanning}>
            {isScanning ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Session
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Detected Devices</p>
                  <h3 className="text-3xl font-bold mt-2">{devices.length}</h3>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <Wifi className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-card shadow-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Session Duration</p>
                <h3 className="text-3xl font-bold mt-2">
                  {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="glass-card shadow-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <h3 className="text-3xl font-bold mt-2">
                  {/* Placeholder logic for rate - requires total students count */}
                   - 
                </h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Detected Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {devices.map((device, index) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {device.studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{device.studentName}</p>
                        <p className="text-sm text-muted-foreground">{device.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Detected at</p>
                        <p className="text-sm font-medium">{device.time}</p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Wifi className="h-3 w-3" />
                        {device.rssi} dBm
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {devices.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Wifi className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No devices detected yet</p>
                  <p className="text-sm mt-1">Start a session to begin scanning</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
