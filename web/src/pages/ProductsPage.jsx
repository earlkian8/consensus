import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";

export default function ProductsPage({
    active,
    products,
    productDraft,
    categories,
    units,
    onDraftChange,
    onAddProduct,
    onDeleteProduct,
    onContinue,
}) {
    return (
        <div id="page-products" className={`page ${active ? "active" : ""}`}>
            <div className="page-title">Product catalog</div>
            <div className="page-sub">
                Add every dish or item your kitchen produces. These will appear as
                options when creating a production plan.
            </div>
            <Card className="card">
                <div className="card-title">Add new product</div>
                <div className="card-sub">Enter details then click Add.</div>
                <div className="row" style={{ marginBottom: "9px" }}>
                    <div className="field" style={{ flex: 2 }}>
                        <label>Product / dish name</label>
                        <Input
                            className="field-input"
                            value={productDraft.name}
                            onChange={(event) => onDraftChange("name", event.target.value)}
                            placeholder="e.g. Chicken Adobo"
                        />
                    </div>
                    <div className="field">
                        <label>Category</label>
                        <select
                            value={productDraft.cat}
                            onChange={(event) => onDraftChange("cat", event.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row" style={{ marginBottom: "9px" }}>
                    <div className="field">
                        <label>Default quantity</label>
                        <Input
                            className="field-input"
                            type="number"
                            min="1"
                            value={productDraft.qty}
                            onChange={(event) => onDraftChange("qty", event.target.value)}
                            placeholder="e.g. 50"
                        />
                    </div>
                    <div className="field">
                        <label>Unit</label>
                        <select
                            value={productDraft.unit}
                            onChange={(event) => onDraftChange("unit", event.target.value)}
                        >
                            {units.map((unit) => (
                                <option key={unit}>{unit}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Cost per unit (PHP)</label>
                        <Input
                            className="field-input"
                            type="number"
                            min="0"
                            value={productDraft.cost}
                            onChange={(event) => onDraftChange("cost", event.target.value)}
                            placeholder="e.g. 120"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="field">
                        <label>Notes (optional)</label>
                        <Input
                            className="field-input"
                            value={productDraft.notes}
                            onChange={(event) => onDraftChange("notes", event.target.value)}
                            placeholder="e.g. popular on weekends"
                        />
                    </div>
                    <div className="field" style={{ flex: 0.4, justifyContent: "flex-end" }}>
                        <label>&nbsp;</label>
                        <Button className="btn btn-green" type="button" onClick={onAddProduct}>
                            + Add
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="section-label">
                Your products (<span>{products.length}</span>)
            </div>
            <div id="product-list">
                {products.length === 0 ? (
                    <div className="empty">
                        <div className="empty-icon">[ ]</div>
                        <div className="empty-title">No products yet</div>
                        <div className="empty-sub">Add your kitchen items above.</div>
                    </div>
                ) : (
                    products.map((product) => (
                        <div className="prod-row fade-in" key={product.id}>
                            <div className="pr-name">{product.name}</div>
                            <div className="pr-info">
                                <Badge className="badge b-gray">{product.cat}</Badge>
                            </div>
                            <div className="pr-unit">
                                {product.qty} {product.unit}
                            </div>
                            <div className="pr-unit" style={{ color: "var(--text-t)" }}>
                                {product.cost ? `PHP ${product.cost}` : ""}
                            </div>
                            <div
                                className="pr-unit"
                                style={{
                                    fontStyle: "italic",
                                    color: "var(--text-t)",
                                    fontSize: "10px",
                                    overflow: "hidden",
                                    maxWidth: "90px",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {product.notes || ""}
                            </div>
                            <Button
                                className="btn btn-sm btn-coral"
                                type="button"
                                onClick={() => onDeleteProduct(product.id)}
                            >
                                X
                            </Button>
                        </div>
                    ))
                )}
            </div>
            {products.length > 0 && (
                <div id="prod-footer" style={{ marginTop: "6px" }}>
                    <Button className="btn btn-green btn-full" type="button" onClick={onContinue}>
                        Continue to Planning -&gt;
                    </Button>
                </div>
            )}
        </div>
    );
}
