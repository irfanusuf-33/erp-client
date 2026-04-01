import { toast } from "sonner";

export const showSuccess = (message: string, description?: string) =>
  toast.success(message, { description });

export const showError = (message: string, description?: string) =>
  toast.error(message, { description });

export const showInfo = (message: string, description?: string) =>
  toast.info(message, { description });

export const showWarning = (message: string, description?: string) =>
  toast.warning(message, { description });

/** Wraps an async call — shows error toast on failure, returns result */
export async function withToast<T>(
  fn: () => Promise<T>,
  errorMessage = "Something went wrong"
): Promise<T | null> {
  try {
    return await fn();
  } catch (err: any) {
    const msg = err?.response?.data?.msg || err?.message || errorMessage;
    toast.error(errorMessage, { description: msg });
    return null;
  }
}
