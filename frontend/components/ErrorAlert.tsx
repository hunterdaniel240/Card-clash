"use client";

import { useState, useEffect } from "react";

interface ErrorAlertProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDuration?: number; // milliseconds, optional
}

export default function ErrorAlert({
  message,
  isVisible,
  onClose,
  autoCloseDuration = 5000,
}: ErrorAlertProps) {
  useEffect(() => {
    if (isVisible && autoCloseDuration > 0) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className="border-[6px] border-black bg-red-400 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-96">
        {/* Alert Header */}
        <div className="border-b-[6px] border-black bg-red-500 p-4 text-center flex items-center justify-between">
          <h3 className="text-xl font-black uppercase italic text-black tracking-tighter">
            ⚠️ Error
          </h3>
          <button
            onClick={onClose}
            className="text-2xl font-black text-black hover:text-red-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Alert Body */}
        <div className="p-4">
          <p className="font-bold text-black text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Alert Footer */}
        <div className="border-t-[6px] border-black bg-white p-3 flex justify-end">
          <button
            onClick={onClose}
            className="border-4 border-black bg-lime-400 px-4 py-2 font-black uppercase text-sm text-black transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
