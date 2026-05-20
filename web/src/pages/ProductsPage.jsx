import { useState } from "react";
import {
    PackageOpen, Trash2, ImagePlus, Pencil,
    Drumstick, Soup, FlameKindling, Wheat, ChefHat,
    Beef, Waves,
} from "lucide-react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/shadcnUI/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/shadcnUI/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/shadcnUI/alert-dialog";
import { PRODUCT_CATEGORIES, DISH_TYPES, DISH_TYPE_UNITS } from "@/lib/consensus-data";

const DISH_TYPE_ICONS = { Drumstick, Soup, FlameKindling, Wheat, ChefHat };

const EMPTY_ERRORS = {
    name: "", dish_type: "", batch_solid_count: "", batch_liquid_volume: "",
};

export default function ProductsPage({
    active, products, productDraft, onDraftChange, onAddProduct,
    onEditProduct, onSaveEditedProduct, onDeleteProduct, onContinue,
    createProductOpen, onOpenCreateProduct, onCloseCreateProduct,
}) {
    const [errors, setErrors] = useState(EMPTY_ERRORS);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const dt = productDraft.dish_type;
    const needsSolid = dt && dt !== "SOUP_STEW";
    const needsLiquid = dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP";

    const validate = () => {
        const e = { ...EMPTY_ERRORS };
        if (!productDraft.name.trim()) e.name = "Product name is required.";
        if (!dt) e.dish_type = "Please select a dish type.";
        if (needsSolid && !productDraft.batch_solid_count) e.batch_solid_count = "This field is required.";
        if (needsLiquid && !productDraft.batch_liquid_volume) e.batch_liquid_volume = "This field is required.";
        setErrors(e);
        return !Object.values(e).some(Boolean);
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) { onDraftChange("image", ""); return; }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") onDraftChange("image", reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDishTypeSelect = (key) => {
        onDraftChange("dish_type", key);
        // Set default unit for the selected dish type
        const units = DISH_TYPE_UNITS[key];
        if (units && units.length > 0) {
            onDraftChange("unit_solid", units[0]);
        }
        setErrors((prev) => ({ ...prev, dish_type: "", batch_solid_count: "", batch_liquid_volume: "" }));
    };

    const handleCreateProduct = () => {
        if (!validate()) return;
        const isEdit = !!productDraft._editId;
        const didSave = isEdit ? onSaveEditedProduct() : onAddProduct();
        if (didSave) {
            setErrors(EMPTY_ERRORS);
            onCloseCreateProduct();
        }
    };

    const handleClose = () => {
        setErrors(EMPTY_ERRORS);
        onCloseCreateProduct();
    };

    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground mb-1">Product catalog</h1>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                        Add every dish or item your kitchen produces. These will appear as options when creating a production plan.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background border rounded-full px-2.5 py-1">
                        {products.length} item{products.length !== 1 ? "s" : ""}
                    </span>
                    <Button type="button" onClick={onOpenCreateProduct}>+ Create product</Button>
                </div>
            </div>

            {/* Empty state */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                        <PackageOpen size={28} className="text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground mb-1">No products yet</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            Add your first item to start building a production plan.
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 mb-6">
                        {products.map((product, index) => {
                            const dishType = DISH_TYPES.find((d) => d.key === product.dish_type);
                            const DishIcon = dishType ? DISH_TYPE_ICONS[dishType.icon] : null;
                            return (
                                <div
                                    key={product.id}
                                    className="group bg-card border rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm relative transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${index * 0.03}s`, animationFillMode: "both" }}
                                >
                                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => onEditProduct(product.id)}
                                            className="w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-pointer"
                                            title="Edit product"
                                        >
                                            <Pencil size={12} className="text-primary" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteConfirmId(product.id)}
                                            className="w-6 h-6 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center cursor-pointer"
                                            title="Remove product"
                                        >
                                            <Trash2 size={12} className="text-destructive" />
                                        </button>
                                    </div>

                                    <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-linear-to-br from-primary/10 to-orange-500/10 border border-black/5">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover block" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                                <div className="text-2xl font-bold text-muted-foreground bg-white/70 rounded-lg px-3 py-2 border border-black/5">
                                                    {product.name ? product.name[0].toUpperCase() : "?"}
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute right-2 bottom-2 px-2 py-1 bg-white/90 border rounded-full text-[10px] font-bold text-foreground shadow-sm backdrop-blur-sm">
                                            {product.qty} {product.unit}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="text-[13px] font-bold text-foreground pr-5">{product.name}</div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Badge variant="secondary" className="text-[10px]">{product.cat}</Badge>
                                            {DishIcon && (
                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <DishIcon size={11} />{dishType.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Button className="w-full justify-center" type="button" onClick={onContinue}>
                        Continue to Planning →
                    </Button>
                </>
            )}

            {/* Create product dialog */}
            <Dialog open={createProductOpen} onOpenChange={(val) => !val && handleClose()}>
                <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-7 pt-6 pb-4 border-b shrink-0">
                        <DialogTitle className="text-lg font-semibold">
                            {productDraft._editId ? "Edit product" : "Create product"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Product name and dish type are required.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">

                        {/* Image + basic fields */}
                        <div className="grid grid-cols-[120px_1fr] gap-5 items-start">
                            <label className="w-full aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-muted hover:border-primary/40 transition-all group/upload">
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                {productDraft.image ? (
                                    <img src={productDraft.image} alt="Product preview" className="w-full h-full object-cover block" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground group-hover/upload:text-foreground transition-colors">
                                        <ImagePlus size={20} />
                                        <span>Upload</span>
                                    </div>
                                )}
                            </label>

                            <div className="flex flex-col gap-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Product name *" error={errors.name}>
                                        <Input
                                            className={`h-10 text-sm ${errors.name ? "border-destructive" : ""}`}
                                            value={productDraft.name}
                                            onChange={(e) => {
                                                onDraftChange("name", e.target.value);
                                                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                                            }}
                                            placeholder="e.g. Chicken Adobo"
                                        />
                                    </Field>

                                    <Field label="Category">
                                        <Select value={productDraft.category} onValueChange={(v) => onDraftChange("category", v)}>
                                            <SelectTrigger className="h-10 text-sm w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRODUCT_CATEGORIES.map((c) => (
                                                    <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* Dish Type card selector */}
                        <div>
                            <div className="flex items-baseline gap-1.5 mb-3">
                                <label className="text-sm font-medium text-foreground">
                                    Dish Type <span className="text-destructive">*</span>
                                </label>
                                <span className="text-xs text-muted-foreground">— determines how portions are measured</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2.5">
                                {DISH_TYPES.map((dishType) => {
                                    const selected = productDraft.dish_type === dishType.key;
                                    const Icon = DISH_TYPE_ICONS[dishType.icon];
                                    return (
                                        <button
                                            key={dishType.key}
                                            type="button"
                                            onClick={() => handleDishTypeSelect(dishType.key)}
                                            className={`flex flex-col items-center text-center gap-1.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                                                selected
                                                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                                    : "border-transparent bg-muted/40 hover:bg-muted hover:border-border"
                                            }`}
                                        >
                                            {Icon && <Icon size={20} className={selected ? "text-primary" : "text-muted-foreground"} />}
                                            <span className={`text-xs font-semibold leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                                                {dishType.label}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground leading-snug">{dishType.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.dish_type && <p className="text-xs text-destructive mt-1.5">{errors.dish_type}</p>}
                        </div>

                        {/* Conditional batch fields */}
                        {dt && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Solid component */}
                                {needsSolid && (
                                    <div className="p-4 rounded-xl bg-muted/30 border">
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <Beef size={14} className="text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                {dt === "SOLID_IN_SOUP" ? "Solid component" : "Batch quantity"}
                                            </span>
                                        </div>
                                        {(dt === "DRY_SCOOPED" || dt === "SAUCE_BASED") && (
                                            <div className="mb-3">
                                                <Field label="Unit of measurement">
                                                    <Select
                                                        value={productDraft.unit_solid || DISH_TYPE_UNITS[dt]?.[0] || "scoops"}
                                                        onValueChange={(v) => onDraftChange("unit_solid", v)}
                                                    >
                                                        <SelectTrigger className="h-10 text-sm w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(DISH_TYPE_UNITS[dt] || []).map((u) => (
                                                                <SelectItem key={u} value={u} className="text-sm">{u}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>
                                        )}
                                        <Field
                                            label="Quantity per batch"
                                            error={errors.batch_solid_count}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    className={`h-10 text-sm flex-1 ${errors.batch_solid_count ? "border-destructive" : ""}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={productDraft.batch_solid_count}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || /^\d+$/.test(val)) {
                                                            onDraftChange("batch_solid_count", val);
                                                            if (errors.batch_solid_count) setErrors((p) => ({ ...p, batch_solid_count: "" }));
                                                        }
                                                    }}
                                                    placeholder="e.g. 50"
                                                />
                                                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                                                    {productDraft.unit_solid || DISH_TYPE_UNITS[dt]?.[0] || (dt === "DRY_SCOOPED" ? "scoops" : "pieces")}
                                                </span>
                                            </div>
                                        </Field>
                                    </div>
                                )}

                                {/* Liquid component */}
                                {needsLiquid && (
                                    <div className="p-4 rounded-xl bg-muted/30 border">
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <Waves size={14} className="text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                {dt === "SOLID_IN_SOUP" ? "Soup component" : "Batch quantity"}
                                            </span>
                                        </div>
                                        <Field label="Volume per batch" error={errors.batch_liquid_volume}>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    className={`h-10 text-sm flex-1 ${errors.batch_liquid_volume ? "border-destructive" : ""}`}
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={productDraft.batch_liquid_volume}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                            onDraftChange("batch_liquid_volume", val);
                                                            if (errors.batch_liquid_volume) setErrors((p) => ({ ...p, batch_liquid_volume: "" }));
                                                        }
                                                    }}
                                                    placeholder="e.g. 5"
                                                />
                                                <span className="text-sm text-muted-foreground font-medium">liters</span>
                                            </div>
                                        </Field>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    <DialogFooter className="mx-0 mb-0 px-7 py-4 border-t shrink-0 flex items-center justify-end gap-3">
                        <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
                        <Button type="button" onClick={handleCreateProduct}>
                            {productDraft._editId ? "Save changes" : "Create product"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the product from your catalog and any linked plans. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                onDeleteProduct(deleteConfirmId);
                                setDeleteConfirmId(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">{label}</label>
            {children}
            {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>
    );
}
