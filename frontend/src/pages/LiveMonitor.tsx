import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Wifi, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/contexts/SocketContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface DetectedDevice {
  id: string; // This will be the MAC address for uniqueness
  studentName: string;
  studentId: string;
  macAddress: string;
  time: string;
  rssi: number;
  isRegistered: boolean;
}

export default function LiveMonitor() {
  const { 
    socket, 
    isConnected, 
    isScanning, 
    setIsScanning, 
    devices, 
    setDevices, 
    sessionTime, 
    setSessionTime 
  } = useSocket();
  
  // Registration Dialog State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedMac, setSelectedMac] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (isScanning) { // If we are stopping
        // Optional: Decide if we want to clear data on stop, or keep it.
        // User might want to review after stopping. 
        // Let's keep it. Use a separate "Clear" button if needed.
        // But the previous behavior was clear on start?
        // Let's clear on START.
    } else {
        // We are starting
        setDevices([]); 
        setSessionTime(0);
    }
  };

  const openRegisterDialog = (mac: string) => {
      setSelectedMac(mac);
      setNewStudentName('');
      setNewStudentId('');
      setIsRegisterOpen(true);
  };



  const handleRegisterSubmit = async () => {
      if (!newStudentName || !newStudentId) {
          toast({
              title: "Error",
              description: "Please fill in all fields",
              variant: "destructive"
          });
          return;
      }

      setIsSubmitting(true);
      try {
          await api.post('/students', {
              name: newStudentName,
              studentId: newStudentId,
              macAddress: selectedMac,
              email: `${newStudentId.toLowerCase()}@student.example.com`, // Auto-generate dummy email if needed
              status: 'active'
          });

          toast({
              title: "Success",
              description: `Registered ${newStudentName} successfully`,
          });
          
          // Optimistically update the local device list to show as registered
          setDevices(prev => prev.map(d => 
              d.macAddress === selectedMac 
              ? { ...d, studentName: newStudentName, studentId: newStudentId, isRegistered: true }
              : d
          ));

          setIsRegisterOpen(false);
      } catch (error: any) {
          console.error("Registration failed:", error);
          toast({
              title: "Registration Failed",
              description: error.response?.data?.message || "Could not register student",
              variant: "destructive"
          });
      } finally {
          setIsSubmitting(false);
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
                <p className="text-sm text-muted-foreground">Known Students</p>
                <h3 className="text-3xl font-bold mt-2">
                   {devices.filter(d => d.isRegistered).length}
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
            <CardTitle>Detected Signal Sources</CardTitle>
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
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        device.isRegistered ? 'bg-primary/10 border border-primary/20' : 'bg-accent/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          device.isRegistered ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="font-semibold">
                          {device.studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{device.studentName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{device.studentId}</span>
                            <span>•</span>
                            <span className="font-mono text-xs">{device.macAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {!device.isRegistered && (
                          <Button size="sm" variant="outline" onClick={() => openRegisterDialog(device.macAddress)}>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Register
                          </Button>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last Signal</p>
                        <p className="text-sm font-medium">{device.time}</p>
                      </div>
                      <Badge variant="outline" className={`gap-1 ${device.isRegistered ? 'border-primary/50 text-primary' : ''}`}>
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

      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Register New Device</DialogTitle>
                <DialogDescription>
                    Associate MAC Address {selectedMac} with a student.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Student Name</Label>
                    <Input id="name" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="sid">Student ID</Label>
                    <Input id="sid" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} placeholder="12345678" />
                </div>
                <div className="grid gap-2">
                    <Label>MAC Address</Label>
                    <Input value={selectedMac} disabled className="bg-muted" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
                <Button onClick={handleRegisterSubmit}>Register Student</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
