interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

function showToast(options: ToastOptions | string) {
  const toastData = typeof options === 'string' ? { title: options } : options;
  const { title, description, variant = "default" } = toastData;
  
  const message = variant === "destructive" ? `ERROR: ${title}` : title;
  console.log(`Toast: ${message}${description ? ` - ${description}` : ''}`);
}

// Create a callable toast function with properties
const toastFunction = (options: ToastOptions | string) => showToast(options);

// Add method properties
toastFunction.success = (title: string, options?: { description?: string }) => 
  showToast({ title, ...options });

toastFunction.error = (title: string, options?: { description?: string }) => 
  showToast({ title, variant: "destructive", ...options });

export const toast = toastFunction;

export function useToast() {
  return {
    toast: toastFunction,
    toasts: [],
  };
}