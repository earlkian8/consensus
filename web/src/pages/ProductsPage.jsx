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
            if (typeof reader.result === "string") onDraftChange("image", reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleCreateProduct = () => {
        const didCreate = onAddProduct();
        if (didCreate) onCloseCreateProduct();
    };

    return (
        <div className={`max-w-215 mx-auto px-4 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground mb-1">Product catalog</h1>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        Add every dish or item your kitchen produces. These will appear as
                        options when creating a production plan.
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background border rounded-full px-2.5 py-1">
                            {products.length} item{products.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
                <Button type="button" onClick={onOpenCreateProduct}>
                    + Create product
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[ ]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No products yet</div>
                    <div className="text-[11px] leading-relaxed">Add your first item to start planning.</div>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-2">
                    {products.map((product, index) => (
                        <div
                            className="bg-background border rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm relative transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                            key={product.id}
                            style={{ animationDelay: `${index * 0.03}s`, animationFillMode: "both" }}
                        >
                            <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-linear-to-br from-primary/10 to-orange-500/10 border border-black/5">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover block" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                                        <div className="text-2xl font-bold text-muted-foreground bg-white/70 rounded-lg px-3 py-2 border border-black/5">
                                            {product.name ? product.name[0] : "?"}
                                        </div>
                                        <span>No image</span>
                                    </div>
                                )}
                                <div className="absolute right-2 bottom-2 px-2 py-1 bg-white/90 border rounded-full text-[10px] font-bold text-foreground shadow-sm backdrop-blur-sm">
                                    {product.qty} {product.unit}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="text-[13px] font-bold text-foreground">{product.name}</div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge variant="secondary" className="text-[10px] bg-secondary text-muted-foreground hover:bg-secondary">
                                        {product.cat}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex justify-end mt-auto">
                                <Button variant="destructive" size="sm" type="button" onClick={() => onDeleteProduct(product.id)}>
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {products.length > 0 && (
                <div className="mt-4">
                    <Button className="w-full justify-center" type="button" onClick={onContinue}>
                        Continue to Planning -&gt;
                    </Button>
                </div>
            )}

            <Dialog open={createProductOpen} onOpenChange={(val) => !val && onCloseCreateProduct()}>
                <DialogContent className="max-w-130">
                    <DialogHeader>
                        <DialogTitle className="text-[15px]">Create product</DialogTitle>
                        <DialogDescription className="text-[11px]">
                            Add an image, name, and quantity to include it in your catalog.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3.5 items-start mt-2">
                        <label className="aspect-square rounded-xl border border-dashed border-border bg-secondary flex items-center justify-center overflow-hidden cursor-pointer">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            {productDraft.image ? (
                                <img src={productDraft.image} alt="Product preview" className="w-full h-full object-cover block" />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                                    <span className="text-2xl font-bold text-muted-foreground">+</span>
                                    Upload image
                                </div>
                            )}
                        </label>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-muted-foreground">Product name</label>
                                <Input
                                    className="h-8.5 text-[13px] bg-background"
                                    value={productDraft.name}
                                    onChange={(event) => {
                                        const val = event.target.value;
                                        if (val === "" || /^[a-zA-Z\s]+$/.test(val)) onDraftChange("name", val);
                                    }}
                                    placeholder="e.g. Chicken Adobo"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-muted-foreground">Quantity</label>
                                <Input
                                    className="h-8.5 text-[13px] bg-background"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={productDraft.qty}
                                    onChange={(event) => {
                                        const val = event.target.value;
                                        if (val === "" || /^\d+$/.test(val)) onDraftChange("qty", val);
                                    }}
                                    placeholder="e.g. 50"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 gap-2 sm:justify-end">
                        <Button variant="outline" type="button" onClick={onCloseCreateProduct}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateProduct}>
                            Create product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}