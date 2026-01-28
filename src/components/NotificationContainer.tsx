"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export default function NotificationContainer({
  notifications,
  onRemove,
}: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Notification({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    if (notification.duration === 0) return;
    const timer = setTimeout(
      () => onRemove(notification.id),
      notification.duration || 4000
    );
    return () => clearTimeout(timer);
  }, [notification, onRemove]);

  const typeStyles = {
    success: {
      bg: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-400/30",
      icon: "✓",
      iconColor: "text-emerald-400",
    },
    error: {
      bg: "from-red-500/20 to-rose-500/20",
      border: "border-red-400/30",
      icon: "✕",
      iconColor: "text-red-400",
    },
    info: {
      bg: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-400/30",
      icon: "ℹ",
      iconColor: "text-blue-400",
    },
  };

  const style = typeStyles[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`backdrop-blur-md bg-linear-to-br ${style.bg} border ${style.border} rounded-lg p-4 max-w-sm shadow-xl`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-xl font-bold ${style.iconColor} shrink-0`}>
          {style.icon}
        </div>
        <p className="text-white/90 text-sm font-medium flex-1">
          {notification.message}
        </p>
        <button
          onClick={() => onRemove(notification.id)}
          className="text-white/50 hover:text-white/80 shrink-0 transition"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
