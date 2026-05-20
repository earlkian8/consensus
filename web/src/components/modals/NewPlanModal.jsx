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
    const selectedCount = selectedProductIds.length;
    const allSelected = products.length > 0 && selectedCount === products.length;

    useEffect(() => {
        if (!selectAllRef.current) return;
        selectAllRef.current.indeterminate =
            selectedCount > 0 && selectedCount < products.length;
    }, [selectedCount, products.length]);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-125 flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-[15px]">Create new plan</DialogTitle>
                    <DialogDescription className="text-[11px]">
                        Name your plan, set the end time, then pick which products to include.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 min-h-0 pr-2">
                    <div className="flex flex-wrap gap-2.5 mb-4">
                        <div className="flex flex-col gap-1 flex-2 min-w-22.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Plan name</label>
                            <Input
                                className="h-8.5 text-[13px] bg-background"
                                value={planName}
                                onChange={(event) => onChangeName(event.target.value)}
                                placeholder="e.g. Plan A - Weekday Lunch"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-22.5">
                            <label className="text-[11px] font-semibold text-muted-foreground">Default end time</label>
                            <Input
                                className="h-8.5 text-[13px] bg-background"
                                type="time"
                                value={endTime}
                                onChange={(event) => onChangeEndTime(event.target.value)}
                            />
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

                <DialogFooter className="mt-4 gap-2 sm:justify-end">
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