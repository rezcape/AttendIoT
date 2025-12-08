import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from '@/hooks/use-toast';

interface AttendanceRecord {
  _id: string;
  studentId: {
    name: string;
    studentId: string;
  };
  timestamp: string;
  status: 'present' | 'absent' | 'late'; // Match backend enum usually lowercase
  rssi?: number;
  deviceId?: string;
}

export default function Attendance() {
  const { socket } = useSocket();
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(),
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      // Build query string based on dateRange if needed
      // For now, just fetch recent
      const response = await api.get('/attendance');
      const data = response.data.data || response.data;
      setRecords(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
       toast({
        title: 'Error',
        description: 'Failed to load attendance records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateRange]); // Refetch if date changes (if backend supports filtering)

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (newRecord: any) => {
        // Prepend new record
        setRecords(prev => [newRecord, ...prev]);
    };

    socket.on('attendance-update', handleUpdate);

    return () => {
        socket.off('attendance-update', handleUpdate);
    };
  }, [socket]);

  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting data...');
    toast({
        title: "Export",
        description: "Export feature coming soon!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
          <p className="text-muted-foreground mt-2">View and export attendance history.</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from && format(dateRange.from, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => date && setDateRange({ from: date })}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Signal (RSSI)</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            {isLoading ? 'Loading...' : 'No attendance records found.'}
                        </td>
                    </tr>
                  ) : (
                    records.map((record, index) => (
                    <motion.tr
                      key={record._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{format(new Date(record.timestamp), 'MMM dd, yyyy')}</span>
                          <span className="text-muted-foreground text-xs">{format(new Date(record.timestamp), 'hh:mm a')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{record.studentId?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{record.studentId?.studentId || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {record.rssi ? (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    'h-3 w-1 rounded-full',
                                    record.rssi && Math.abs(record.rssi) < 50 + i * 10
                                      ? 'bg-success'
                                      : 'bg-muted'
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs">{record.rssi} dBm</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                    </motion.tr>
                  )))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
