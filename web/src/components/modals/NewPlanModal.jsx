import { useEffect, useRef } from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";

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
        if (!selectAllRef.current) {
            return;
        }
        selectAllRef.current.indeterminate =
            selectedCount > 0 && selectedCount < products.length;
    }, [selectedCount, products.length]);

    return (
        <div className={`modal-bg ${open ? "" : "hidden"}`} id="new-plan-modal">
            <div className="modal">
                <div className="modal-title">Create new plan</div>
                <div className="modal-sub">
                    Name your plan, set the end time, then pick which products to include.
                </div>

                <div className="modal-scroll">
                    <div className="row" style={{ marginBottom: "12px" }}>
                        <div className="field" style={{ flex: 2 }}>
                            <label>Plan name</label>
                            <Input
                                className="field-input"
                                value={planName}
                                onChange={(event) => onChangeName(event.target.value)}
                                placeholder="e.g. Plan A - Weekday Lunch"
                            />
                        </div>
                        <div className="field">
                            <label>Default end time</label>
                            <Input
                                className="field-input"
                                type="time"
                                value={endTime}
                                onChange={(event) => onChangeEndTime(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="select-label">Select products to include</div>

                    <div className="select-all-row" onClick={onToggleSelectAll} role="button">
                        <input
                            ref={selectAllRef}
                            type="checkbox"
                            checked={allSelected}
                            onChange={onToggleSelectAll}
                            onClick={(event) => event.stopPropagation()}
                        />
                        <span>Select all</span>
                        <span className="select-counter">
                            {selectedCount} of {products.length} selected
                        </span>
                    </div>

                    <div id="np-product-list" style={{ marginBottom: "4px" }}>
                        {products.map((product) => {
                            const isSelected = selectedProductIds.includes(product.id);
                            return (
                                <div
                                    className={`prod-select-item ${isSelected ? "selected" : ""}`}
                                    key={product.id}
                                    onClick={() => onToggleProduct(product.id)}
                                    role="button"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onToggleProduct(product.id)}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div className="psi-name">{product.name}</div>
                                        <div className="psi-meta">
                                            <Badge className="badge b-gray" style={{ fontSize: "9px" }}>
                                                {product.cat}
                                            </Badge>
                                            {product.notes && (
                                                <span className="psi-note">{product.notes}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="psi-qty">
                                        {product.qty} {product.unit}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-actions">
                    <Button className="btn" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className="btn btn-green" type="button" onClick={onCreate}>
                        Create plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
