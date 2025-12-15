import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface DetectedDevice {
  id: string;
  studentName: string;
  studentId: string;
  macAddress: string;
  time: string;
  rssi: number;
  isRegistered: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  devices: DetectedDevice[];
  setDevices: React.Dispatch<React.SetStateAction<DetectedDevice[]>>;
  sessionTime: number;
  setSessionTime: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isScanning: false,
  setIsScanning: () => {},
  devices: [],
  setDevices: () => {},
  sessionTime: 0,
  setSessionTime: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const [sessionTime, setSessionTime] = useState(0);

  // Session timer: Runs globally if scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Global Event Listeners for Data Collection
  useEffect(() => {
    if (!socket) return;

    const handleDeviceDetected = (data: any) => {
        console.log("Socket received 'device-detected':", data); // DEBUG LOG
        // if (!isScanning) return; // Only collect if scanning - DISABLED FOR DEBUGGING
        
        if (data && data.devices && Array.isArray(data.devices)) {
            const timestamp = new Date().toLocaleTimeString();
            
            setDevices(prevDevices => {
                const newDevicesMap = new Map(prevDevices.map(d => [d.macAddress, d]));
                
                data.devices.forEach((device: any) => {
                    const existing = newDevicesMap.get(device.mac);
                    
                    if (existing) {
                        newDevicesMap.set(device.mac, {
                            ...existing,
                            rssi: device.rssi,
                            time: timestamp
                        });
                    } else {
                        newDevicesMap.set(device.mac, {
                            id: device.mac,
                            studentName: device.name || 'Unknown Device',
                            studentId: 'Scanning...',
                            macAddress: device.mac,
                            time: timestamp,
                            rssi: device.rssi,
                            isRegistered: false
                        });
                    }
                });
                
                return Array.from(newDevicesMap.values())
                    .sort((a, b) => b.time.localeCompare(a.time))
                    .slice(0, 50);
            });
        }
    };
    
    const handleAttendanceUpdate = (record: any) => {
        if (!isScanning) return;

        setDevices(prevDevices => {
            const newDevicesMap = new Map(prevDevices.map(d => [d.macAddress, d]));
            const mac = record.macAddress;
            
            if (mac) {
                 newDevicesMap.set(mac, {
                    id: mac,
                    studentName: record.studentId?.name || 'Unknown Student',
                    studentId: record.studentId?.studentId || 'N/A',
                    macAddress: mac,
                    time: new Date().toLocaleTimeString(),
                    rssi: record.rssi || 0,
                    isRegistered: true
                });
            }
            
            return Array.from(newDevicesMap.values())
                .sort((a, b) => b.time.localeCompare(a.time))
                .slice(0, 50);
        });
    };

    socket.on('device-detected', handleDeviceDetected);
    socket.on('attendance-update', handleAttendanceUpdate);

    return () => {
      socket.off('device-detected', handleDeviceDetected);
      socket.off('attendance-update', handleAttendanceUpdate);
    };
  }, [socket, isScanning]);

  return (
    <SocketContext.Provider value={{ 
        socket, 
        isConnected, 
        isScanning, 
        setIsScanning,
        devices,
        setDevices,
        sessionTime,
        setSessionTime
    }}>
      {children}
    </SocketContext.Provider>
  );
};
