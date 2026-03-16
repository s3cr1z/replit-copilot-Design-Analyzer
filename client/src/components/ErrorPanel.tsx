import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const STANDARD_ERROR_COPY = {
  query: "We couldn't load this data. Check your connection and try again. If it keeps failing, refresh the page.",
  mutation: "This action didn't go through. Check your connection and try again. If it keeps failing, refresh the page.",
} as const;

type ErrorPanelProps = {
  message?: string;
  technicalDetail?: string;
  onRetry: () => void;
  retryLabel?: string;
};

export function ErrorPanel({
  message = STANDARD_ERROR_COPY.query,
  technicalDetail,
  onRetry,
  retryLabel = "Retry",
}: ErrorPanelProps) {
  return (
    <Card className="bg-card border-card-border p-4" data-testid="error-panel">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {technicalDetail ? (
            <p className="text-xs text-muted-foreground mt-1 break-words">{technicalDetail}</p>
          ) : null}
          <Button variant="destructive" size="sm" className="mt-3" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}
