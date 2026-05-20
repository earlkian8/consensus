import { firePromiseToast } from "@/components/sileo/SileoToast"
import { Button } from "@/components/shadcnUI/button"

export default function PromiseToast({
  promise = () => new Promise((resolve) => setTimeout(resolve, 2000)),
  loadingTitle = "Loading",
  loadingDescription = "Please wait...",
  successTitle = "Done",
  successDescription = "Data loaded successfully!",
  errorTitle = "Error",
  errorDescription = "Failed to load data.",
  label = "Try it",
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Promise Toast</h3>
      <p className="text-sm text-muted-foreground">
        Chain loading, success, and error states from a single promise.
      </p>
      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              firePromiseToast(promise, {
                loading: {
                  title: loadingTitle,
                  description: loadingDescription,
                },
                success: {
                  title: successTitle,
                  description: successDescription,
                },
                error: {
                  title: errorTitle,
                  description: errorDescription,
                },
              })
            }
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  )
}
