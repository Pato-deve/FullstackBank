import { useRef, useEffect } from "react";
import type { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        onClose();
      }}
      className={`md:fixed md:top-1/2 md:left-1/2 flex-col w-screen h-screen md:size-min md:min-w-[30vw] md:max-h-[75vh] bg-[#f8f9fa] p-16 overflow-y-scroll scrollbar-none gap-4 rounded-2xl box-border md:-translate-y-1/2 md:-translate-x-1/2 ${open && "flex"}`}
    >
      <button
        type="button"
        className="absolute top-0 right-0 m-8"
        tabIndex={-1}
        onClick={() => onClose()}
      >
      </button>
      <h1 className="text-xl font-medium">{title}</h1>
      {children}
    </dialog>
  );
}