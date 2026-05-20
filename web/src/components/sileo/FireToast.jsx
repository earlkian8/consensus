import { fireToast } from "@/components/sileo/SileoToast"
import { Button } from "@/components/shadcnUI/button"

export default function FireToast({
  successTitle = "Success",
  successDescription = "Operation completed successfully.",
  errorTitle = "Error",
  errorDescription = "Something went wrong.",
  warningTitle = "Warning",
  warningDescription = "Please check your input.",
  infoTitle = "Info",
  infoDescription = "Here is some useful information.",
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Fire a Toast</h3>
      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              fireToast("success", {
                title: successTitle,
                description: successDescription,
              })
            }
          >
            Success
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              fireToast("error", {
                title: errorTitle,
                description: errorDescription,
              })
            }
          >
            Error
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              fireToast("warning", {
                title: warningTitle,
                description: warningDescription,
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              fireToast("info", {
                title: infoTitle,
                description: infoDescription,
              })
            }
          >
            Info
          </Button>
        </div>
      </div>
    </div>
  )
}
