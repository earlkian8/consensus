import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";

export default function ProductsPage({
    active,
    products,
    productDraft,
    onDraftChange,
    onAddProduct,
    onDeleteProduct,
    onContinue,
    createProductOpen,
    onOpenCreateProduct,
    onCloseCreateProduct,
}) {
    const handleImageChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            onDraftChange("image", "");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onDraftChange("image", reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCreateProduct = () => {
        const didCreate = onAddProduct();
        if (didCreate) {
            onCloseCreateProduct();
        }
    };

    return (
        <div id="page-products" className={`page ${active ? "active" : ""}`}>
            <div className="products-head">
                <div>
                    <div className="page-title">Product catalog</div>
                    <div className="page-sub">
                        Add every dish or item your kitchen produces. These will appear as
                        options when creating a production plan.
                    </div>
                    <div className="products-meta">
                        <span className="products-count">
                            {products.length} item{products.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
                <Button className="btn btn-green" type="button" onClick={onOpenCreateProduct}>
                    + Create product
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="empty product-empty">
                    <div className="empty-icon">[ ]</div>
                    <div className="empty-title">No products yet</div>
                    <div className="empty-sub">Add your first item to start planning.</div>
                    <Button
                        className="btn btn-green"
                        style={{ marginTop: "10px" }}
                        type="button"
                        onClick={onOpenCreateProduct}
                    >
                        Create product
                    </Button>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((product, index) => (
                        <div
                            className="product-card fade-in"
                            key={product.id}
                            style={{ animationDelay: `${index * 0.03}s` }}
                        >
                            <div className="product-media">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} />
                                ) : (
                                    <div className="product-fallback">
                                        <div className="product-fallback-letter">
                                            {product.name ? product.name[0] : "?"}
                                        </div>
                                        <div className="product-fallback-text">No image</div>
                                    </div>
                                )}
                                <div className="product-chip">
                                    {product.qty} {product.unit}
                                </div>
                            </div>
                            <div className="product-body">
                                <div className="product-name">{product.name}</div>
                                <div className="product-meta">
                                    <Badge className="badge b-gray">{product.cat}</Badge>
                                </div>
                            </div>
                            <div className="product-actions">
                                <Button
                                    className="btn btn-sm btn-coral"
                                    type="button"
                                    onClick={() => onDeleteProduct(product.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {products.length > 0 && (
                <div id="prod-footer" style={{ marginTop: "10px" }}>
                    <Button className="btn btn-green btn-full" type="button" onClick={onContinue}>
                        Continue to Planning -&gt;
                    </Button>
                </div>
            )}

            <div
                className={`modal-bg ${createProductOpen ? "" : "hidden"}`}
                id="create-product-modal"
            >
                <div className="modal create-product-modal">
                    <div className="modal-title">Create product</div>
                    <div className="modal-sub">
                        Add an image, name, and quantity to include it in your catalog.
                    </div>

                    <div className="modal-scroll">
                        <div className="create-product-grid">
                            <div className="create-product-preview">
                                {productDraft.image ? (
                                    <img src={productDraft.image} alt="Product preview" />
                                ) : (
                                    <div className="create-product-placeholder">
                                        <span>+</span>
                                        Upload image
                                    </div>
                                )}
                            </div>
                            <div className="create-product-fields">
                                <div className="field">
                                    <label>Image</label>
                                    <Input
                                        className="field-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <div className="field">
                                    <label>Product name</label>
                                    <Input
                                        className="field-input"
                                        value={productDraft.name}
                                        onChange={(event) =>
                                            onDraftChange("name", event.target.value)
                                        }
                                        placeholder="e.g. Chicken Adobo"
                                    />
                                </div>
                                <div className="field">
                                    <label>Quantity</label>
                                    <Input
                                        className="field-input"
                                        type="number"
                                        min="1"
                                        value={productDraft.qty}
                                        onChange={(event) =>
                                            onDraftChange("qty", event.target.value)
                                        }
                                        placeholder="e.g. 50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <Button className="btn" type="button" onClick={onCloseCreateProduct}>
                            Cancel
                        </Button>
                        <Button
                            className="btn btn-green"
                            type="button"
                            onClick={handleCreateProduct}
                        >
                            Create product
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
