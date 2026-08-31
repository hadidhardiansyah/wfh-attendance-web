import { useToastStore } from "../store/toastStore";

export const toast = {
  success: (message: string, title: string = "Success") => {
    useToastStore.getState().addToast({ type: "success", title, message });
  },
  error: (message: string, title: string = "Error") => {
    useToastStore.getState().addToast({ type: "error", title, message });
  },
  warning: (message: string, title: string = "Warning") => {
    useToastStore.getState().addToast({ type: "warning", title, message });
  },
  info: (message: string, title: string = "Info") => {
    useToastStore.getState().addToast({ type: "info", title, message });
  },
};
