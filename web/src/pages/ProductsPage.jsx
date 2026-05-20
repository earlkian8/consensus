import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    PackageOpen, Trash2, ImagePlus, Pencil,
    Drumstick, Soup, FlameKindling, Wheat, ChefHat,
    Beef, Waves, Loader2, Search, ChevronLeft, ChevronRight,
    Package, Layers, UtensilsCrossed,
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
const ITEMS_PER_PAGE = 15;

const EMPTY_ERRORS = {
    name: "", dish_type: "", batch_solid_count: "", batch_liquid_volume: "",
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } },
    exit: { opacity: 0, scale: 0.92, y: -6, transition: { duration: 0.15 } },
};

export default function ProductsPage({
    active, products, productDraft, onDraftChange, onAddProduct,
    onEditProduct, onSaveEditedProduct, onDeleteProduct, onContinue,
    createProductOpen, onOpenCreateProduct, onCloseCreateProduct,
}) {
    const [errors, setErrors] = useState(EMPTY_ERRORS);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Filters, sorting, pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("a-z");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterDishType, setFilterDishType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((p) => p.name.toLowerCase().includes(q));
        }

        // Category filter
        if (filterCategory !== "all") {
            result = result.filter((p) => p.cat === filterCategory);
        }

        // Dish type filter
        if (filterDishType !== "all") {
            result = result.filter((p) => p.dish_type === filterDishType);
        }

        // Sort
        if (sortOrder === "a-z") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === "z-a") {
            result.sort((a, b) => b.name.localeCompare(a.name));
        }

        return result;
    }, [products, searchQuery, sortOrder, filterCategory, filterDishType]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProducts = filteredProducts.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

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
        const units = DISH_TYPE_UNITS[key];
        if (units && units.length > 0) onDraftChange("unit_solid", units[0]);
        setErrors((prev) => ({ ...prev, dish_type: "", batch_solid_count: "", batch_liquid_volume: "" }));
    };

    const handleCreateProduct = () => {
        if (!validate() || submitting) return;
        const isEdit = !!productDraft._editId;
        setSubmitting(true);
        setErrors(EMPTY_ERRORS);
        onCloseCreateProduct();
        // Delay product creation so modal exit animation completes before card + toast appear
        setTimeout(() => {
            const result = isEdit ? onSaveEditedProduct() : onAddProduct();
            Promise.resolve(result).finally(() => setSubmitting(false));
        }, 200);
    };

    const handleClose = () => {
        if (submitting) return;
        setErrors(EMPTY_ERRORS);
        onCloseCreateProduct();
    };

    return (
        <div className={`max-w-6xl mx-auto px-6 py-5 ${active ? "block" : "hidden"}`}>

            {/* Header */}
            <motion.div
                className="flex items-center justify-between gap-4 mb-4"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <div>
                    <h1 className="text-lg font-bold text-foreground">Product catalog</h1>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Manage your kitchen's dishes. These appear as options in production plans.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={products.length}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.12 }}
                            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 border rounded-full px-2.5 py-0.5"
                        >
                            {products.length}
                        </motion.span>
                    </AnimatePresence>
                    {products.length > 0 && (
                        <Button variant="ghost" size="sm" type="button" onClick={onContinue} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                            Planning
                            <ChevronRight size={14} />
                        </Button>
                    )}
                    <Button size="sm" type="button" onClick={onOpenCreateProduct}>+ Add product</Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            {products.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                            <Package size={18} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">{products.length}</div>
                            <div className="text-[10px] text-muted-foreground">Product{products.length !== 1 ? "s" : ""}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
                            <Layers size={18} className="text-accent-foreground" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">
                                {products.reduce((sum, p) => sum + (p.qty || 0), 0)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Total batch output</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100">
                            <UtensilsCrossed size={18} className="text-purple-700" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">
                                {new Set(products.map((p) => p.cat)).size}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Categories</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            {products.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="relative flex-1 min-w-[180px] max-w-xs">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            className="h-8 text-xs pl-8 bg-background"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-8 text-xs w-[100px] bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="a-z" className="text-xs">A → Z</SelectItem>
                            <SelectItem value="z-a" className="text-xs">Z → A</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-8 text-xs w-[130px] bg-background">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all" className="text-xs">All categories</SelectItem>
                            {PRODUCT_CATEGORIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterDishType} onValueChange={(v) => { setFilterDishType(v); setCurrentPage(1); }}>
                        <SelectTrigger className="h-8 text-xs w-[130px] bg-background">
                            <SelectValue placeholder="Dish type" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="all" className="text-xs">All types</SelectItem>
                            {DISH_TYPES.map((d) => (
                                <SelectItem key={d.key} value={d.key} className="text-xs">{d.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {products.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center py-16 gap-3 text-center"
                    >
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center"
                        >
                            <PackageOpen size={24} className="text-muted-foreground" />
                        </motion.div>
                        <div>
                            <div className="text-sm font-semibold text-foreground mb-0.5">No products yet</div>
                            <div className="text-xs text-muted-foreground">
                                Click "+ Add product" to get started.
                            </div>
                        </div>
                    </motion.div>
                ) : filteredProducts.length === 0 ? (
                    <motion.div
                        key="no-results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 gap-2 text-center"
                    >
                        <Search size={20} className="text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">No products match your filters.</div>
                    </motion.div>
                ) : (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            <AnimatePresence>
                                {paginatedProducts.map((product) => {
                                    const dishType = DISH_TYPES.find((d) => d.key === product.dish_type);
                                    const DishIcon = dishType ? DISH_TYPE_ICONS[dishType.icon] : null;
                                    return (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className={`group bg-card border rounded-xl p-2.5 flex flex-col gap-2 shadow-sm relative transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:scale-[1.02] ${product._saving ? "opacity-60 pointer-events-none" : ""}`}
                                        >
                                            {product._saving && (
                                                <div className="absolute inset-0 rounded-xl bg-background/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
                                                    <Loader2 size={18} className="animate-spin text-primary" />
                                                </div>
                                            )}

                                            {/* Action buttons — slide in from right */}
                                            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
                                                <motion.button
                                                    type="button"
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => onEditProduct(product.id)}
                                                    className="w-6 h-6 rounded-full bg-white/90 shadow-sm border flex items-center justify-center cursor-pointer hover:bg-primary/10"
                                                    title="Edit"
                                                >
                                                    <Pencil size={11} className="text-primary" />
                                                </motion.button>
                                                <motion.button
                                                    type="button"
                                                    whileTap={{ scale: 0.85 }}
                                                    onClick={() => setDeleteConfirmId(product.id)}
                                                    className="w-6 h-6 rounded-full bg-white/90 shadow-sm border flex items-center justify-center cursor-pointer hover:bg-destructive/10"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} className="text-destructive" />
                                                </motion.button>
                                            </div>

                                            {/* Image area */}
                                            <div className="relative rounded-lg overflow-hidden aspect-4/3 bg-linear-to-br from-primary/8 to-orange-500/8 border border-black/5">
                                                {product.image ? (
                                                    <>
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover block" />
                                                        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        {DishIcon ? (
                                                            <DishIcon size={28} className="text-muted-foreground/40" />
                                                        ) : (
                                                            <span className="text-xl font-bold text-muted-foreground/40">
                                                                {product.name?.[0]?.toUpperCase() || "?"}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 bg-white/90 border rounded-full text-[9px] font-bold text-foreground shadow-sm backdrop-blur-sm">
                                                    {product.qty} {product.unit}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-col gap-1 min-h-0">
                                                <div className="text-xs font-bold text-foreground leading-tight line-clamp-1">{product.name}</div>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{product.cat}</Badge>
                                                    {dishType && (
                                                        <span className="text-[9px] text-muted-foreground">{dishType.label}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={safeCurrentPage <= 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronLeft size={14} />
                                </Button>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {safeCurrentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={safeCurrentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="h-7 w-7 p-0"
                                >
                                    <ChevronRight size={14} />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create / Edit dialog */}
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

                    <div className="flex-1 overflow-y-auto scroll-smooth px-7 py-6 flex flex-col gap-6">

                        {/* Image + basic fields */}
                        <div className="grid grid-cols-[120px_1fr] gap-5 items-start">
                            <label className="w-full aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-muted hover:border-primary/40 transition-all group/upload relative">
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                {productDraft.image ? (
                                    <>
                                        <img src={productDraft.image} alt="Product preview" className="w-full h-full object-cover block" />
                                        <div className="absolute inset-0 bg-black/0 group-hover/upload:bg-black/40 transition-colors flex items-center justify-center">
                                            <span className="text-white text-[10px] font-semibold opacity-0 group-hover/upload:opacity-100 transition-opacity">Change</span>
                                        </div>
                                    </>
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

                        {/* Dish Type */}
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
                                        <motion.button
                                            key={dishType.key}
                                            type="button"
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDishTypeSelect(dishType.key)}
                                            className={`flex flex-col items-center text-center gap-1.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                                                selected
                                                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                                    : "border-transparent bg-muted/40 hover:bg-muted hover:border-border"
                                            }`}
                                        >
                                            {selected && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </div>
                                            )}
                                            {Icon && <Icon size={20} className={selected ? "text-primary" : "text-muted-foreground"} />}
                                            <span className={`text-xs font-semibold leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                                                {dishType.label}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground leading-snug">{dishType.desc}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                            {errors.dish_type && <p className="text-xs text-destructive mt-1.5">{errors.dish_type}</p>}
                        </div>

                        {/* Conditional batch fields */}
                        <AnimatePresence>
                            {dt && (
                                <motion.div
                                    key={dt}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                >
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
                                            <Field label="Quantity per batch" error={errors.batch_solid_count}>
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
                                                    <span className="text-sm text-muted-foreground font-medium">L</span>
                                                </div>
                                            </Field>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DialogFooter className="mx-0 mb-0 px-7 py-4 border-t shrink-0 flex items-center justify-end gap-3">
                        <Button variant="outline" type="button" onClick={handleClose} disabled={submitting}>Cancel</Button>
                        <Button type="button" onClick={handleCreateProduct} disabled={submitting} className="min-w-[130px]">
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    Saving…
                                </span>
                            ) : (
                                productDraft._editId ? "Save changes" : "Create product"
                            )}
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
                            This will permanently remove the product from your catalog and any linked plans.
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
