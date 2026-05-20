import { Button } from "@/components/shadcnUI/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcnUI/dialog";

export default function EndSessionModal({ open, onCancel, onConfirm }) {
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
            <DialogContent className="max-w-100">
                <DialogHeader>
                    <DialogTitle className="text-[15px]">End session early?</DialogTitle>
                    <DialogDescription className="text-[11px]">
                        The scheduled end time has not been reached. Are you sure?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:justify-end">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="destructive" type="button" onClick={onConfirm}>
                        Yes, end session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}