import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, children, width = 540 }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.55)] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-[90vw] rounded-2xl shadow-[0_24px_64px_rgba(15,23,42,0.25)] p-7 relative"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-[18px] right-[18px] bg-transparent border-none text-lg text-[#94A3B8] cursor-pointer leading-none hover:text-[#64748B]"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
