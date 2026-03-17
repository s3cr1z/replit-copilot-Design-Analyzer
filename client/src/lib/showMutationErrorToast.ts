import { STANDARD_ERROR_COPY } from "@/components/ErrorPanel";

type ToastFn = (props: { variant?: "default" | "destructive"; description?: string }) => void;

type ShowMutationErrorToastArgs = {
  toast: ToastFn;
  actionLabel: string;
  error: unknown;
};

export function showMutationErrorToast({ toast, actionLabel, error }: ShowMutationErrorToastArgs) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  toast({
    variant: "destructive",
    description: `Couldn't ${actionLabel}. ${STANDARD_ERROR_COPY.mutation} ${errorMessage}`,
  });
}
