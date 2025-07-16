import React from "react";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast components for now
export const Toast = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastTitle = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastDescription = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastClose = ({ ...props }: any) => <button {...props}>×</button>;
export const ToastProvider = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const ToastViewport = ({ ...props }: any) => <div {...props} />;
export const ToastAction = ({ children, ...props }: any) => <button {...props}>{children}</button>;

export type ToastProps = any;
export type ToastActionElement = React.ReactElement;

function showToast({ title, description, variant = "default" }: ToastOptions) {
  const message = variant === "destructive" ? `ERROR: ${title}` : title;
  console.log(`Toast: ${message}${description ? ` - ${description}` : ''}`);
}

export const toast = {
  success: (title: string, options?: { description?: string }) => 
    showToast({ title, ...options }),
  error: (title: string, options?: { description?: string }) => 
    showToast({ title, variant: "destructive", ...options }),
};