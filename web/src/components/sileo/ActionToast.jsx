import { fireToast } from "@/components/sileo/SileoToast"
import { Button } from "@/components/shadcnUI/button"

export default function ActionToast({
  title = "Event Created",
  description = "Your event has been scheduled.",
  buttonTitle = "Undo",
  onButtonClick = () => console.log("Undo clicked"),
  label = "Try it",
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Action Toast</h3>
      <p className="text-sm text-muted-foreground">
        Toasts can include a button for user interaction.
      </p>
      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              fireToast("action", {
                title,
                description,
                button: {
                  title: buttonTitle,
                  onClick: onButtonClick,
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
