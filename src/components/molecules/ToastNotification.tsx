import React from 'react';
import { StatusDot } from '../atoms/StatusDot';

type ToastNotificationProps = {
  message: string;
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => (
  <div
    role="status"
    className="fixed bottom-5 right-5 z-[80] flex max-w-[calc(100vw-2.5rem)] items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"
  >
    <StatusDot className="shrink-0 bg-sky-400" />
    <span className="truncate">{message}</span>
  </div>
);
