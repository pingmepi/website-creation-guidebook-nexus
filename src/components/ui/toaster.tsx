import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  // Simple implementation - in a real app you'd render actual toast UI
  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50">
      {toasts.map((toast: any, index: number) => (
        <div key={index} className="mb-2 p-3 bg-white border rounded shadow">
          {toast.title && <div className="font-semibold">{toast.title}</div>}
          {toast.description && <div className="text-sm text-gray-600">{toast.description}</div>}
        </div>
      ))}
    </div>
  );
}