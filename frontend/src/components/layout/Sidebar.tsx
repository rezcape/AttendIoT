import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Radio,
  Upload,
  User,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: ClipboardList, label: 'Attendance', path: '/attendance' },
  { icon: Radio, label: 'Live Monitor', path: '/live-monitor' },
  { icon: Upload, label: 'Upload Files', path: '/upload' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      className="fixed left-0 top-0 z-40 h-screen bg-card shadow-elegant border-r border-border"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border px-4">
          <motion.div
            animate={{ scale: isOpen ? 1 : 0.8 }}
            className="flex items-center gap-2"
          >
            <img src="/AttendIoT_logo.png" alt="AttendIoT Logo" className="h-10 w-10 object-contain" />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-lg text-foreground"
              >
                AttendIoT
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};
