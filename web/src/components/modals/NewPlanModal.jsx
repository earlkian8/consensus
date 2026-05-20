import { useEffect, useRef } from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadcnUI/dialog";
import { Clock } from "lucide-react";

export default function NewPlanModal({
    open,
    products,
    selectedProductIds,
    planName,
    endTime,
    onChangeName,
    onChangeEndTime,
    onToggleSelectAll,
    onToggleProduct,
    onClose,
    onCreate,
}) {
    const selectAllRef = useRef(null);
    const nameInputRef = useRef(null);
    const selectedCount = selectedProductIds.length;
    const allSelected = products.length > 0 && selectedCount === products.length;

    useEffect(() => {
        if (!selectAllRef.current) return;
        selectAllRef.current.indeterminate =
            selectedCount > 0 && selectedCount < products.length;
    }, [selectedCount, products.length]);

    // Prevent auto-select on the plan name input when modal opens
    useEffect(() => {
        if (open && nameInputRef.current) {
            const input = nameInputRef.current;
            // Move cursor to end instead of selecting all text
            requestAnimationFrame(() => {
                const len = input.value.length;
                input.setSelectionRange(len, len);
            });
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-7 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-lg font-semibold">Create new plan</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Name your plan, set the end time, then pick which products to include.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-7 py-6 min-h-0">
                    <div className="flex flex-wrap gap-2.5 mb-4">
                        <div className="flex flex-col gap-1 flex-2 min-w-22.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Plan name</label>
                            <Input
                                ref={nameInputRef}
                                className="h-8.5 text-[13px] bg-background"
                                value={planName}
                                onChange={(event) => onChangeName(event.target.value)}
                                onFocus={(e) => {
                                    // Prevent browser auto-select behavior
                                    const input = e.target;
                                    requestAnimationFrame(() => {
                                        const len = input.value.length;
                                        input.setSelectionRange(len, len);
                                    });
                                }}
                                placeholder="e.g. Plan A - Weekday Lunch"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-22.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Default end time</label>
                            <div className="relative">
                                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                                    <Clock className="size-4" />
                                </div>
                                <Input
                                    type="time"
                                    id="end-time"
                                    className="peer h-8.5 text-[13px] bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    value={endTime}
                                    onChange={(event) => onChangeEndTime(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Select products to include
                    </div>

                    <div
                        className="flex items-center gap-2 px-3 py-2 mb-2 text-[11px] font-bold text-muted-foreground cursor-pointer rounded-lg hover:bg-secondary"
                        onClick={onToggleSelectAll}
                        role="button"
                    >
                        <input
                            ref={selectAllRef}
                            type="checkbox"
                            className="w-4 h-4 accent-primary cursor-pointer"
                            checked={allSelected}
                            onChange={onToggleSelectAll}
                            onClick={(event) => event.stopPropagation()}
                        />
                        <span>Select all</span>
                        <span className="ml-auto text-muted-foreground font-normal">
                            {selectedCount} of {products.length} selected
                        </span>
                    </div>

                    <div className="mb-1 flex flex-col gap-2">
                        {products.map((product) => {
                            const isSelected = selectedProductIds.includes(product.id);
                            return (
                                <div
                                    className={`flex items-center gap-2.5 px-3 py-2.5 border-[1.5px] rounded-lg cursor-pointer transition-colors select-none ${isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-border bg-background hover:bg-secondary/50"
                                        }`}
                                    key={product.id}
                                    onClick={() => onToggleProduct(product.id)}
                                    role="button"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                                        checked={isSelected}
                                        onChange={() => onToggleProduct(product.id)}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                    <div className="flex-1">
                                        <div className="text-[13px] font-semibold">{product.name}</div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Badge variant="secondary" className="text-[9px] px-2 py-0">
                                                {product.cat}
                                            </Badge>
                                            {product.notes && (
                                                <span className="italic text-[10px]">{product.notes}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-semibold text-muted-foreground">
                                        {product.qty} {product.unit}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter className="mx-0 mb-0 px-7 py-4 border-t shrink-0 flex items-center justify-end gap-3">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onCreate}>
                        Create plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}