import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DetectedDevice {
  id: string;
  studentName: string;
  studentId: string;
  time: string;
  rssi: number;
}

const mockDevices: DetectedDevice[] = [
  { id: '1', studentName: 'Alice Johnson', studentId: 'STU001', time: '08:15:23', rssi: -45 },
  { id: '2', studentName: 'Bob Smith', studentId: 'STU002', time: '08:15:45', rssi: -52 },
  { id: '3', studentName: 'Carol Williams', studentId: 'STU003', time: '08:16:12', rssi: -48 },
];

export default function LiveMonitor() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DetectedDevice[]>(mockDevices);
  const [sessionTime, setSessionTime] = useState(0);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
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
                  {devices.length > 0 ? Math.round((devices.length / 248) * 100) : 0}%
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
