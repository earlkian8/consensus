import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/shadcnUI/button";
import { motion } from "framer-motion";
import Typed from "typed.js";
import {
    Leaf, TrendingDown, BarChart3, ArrowRight,
    ChefHat, Clock, Sparkles, ShieldCheck,
    AlertTriangle, DollarSign, Recycle, Users,
    Database, Globe, Cpu, Layers,
    Store, Utensils, Building2, Truck,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
};

export default function LandingPage() {
    const typedRef = useRef(null);

    useEffect(() => {
        const typed = new Typed(typedRef.current, {
            strings: ["less waste", "smarter plans", "better insights", "real impact"],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2000,
            loop: true,
        });
        return () => typed.destroy();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-teal-800 flex items-center justify-center shadow-sm">
                            <Leaf size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-sm text-primary tracking-wide">Consensus</span>
                    </div>
                    <Link to="/dashboard">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                            <Leaf size={14} />
                            SDG 12 — Responsible Consumption
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                            Smarter kitchens,
                            <span className="text-primary"> <span ref={typedRef} /></span>
                        </h1>
                        <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-lg">
                            Consensus is an AI-powered food excess management system that helps
                            commercial kitchens plan smarter, track production in real time, and
                            turn waste data into actionable insights.
                        </p>
                        <Link to="/dashboard">
                            <Button size="lg" className="gap-2 px-6">
                                Try the system
                                <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="relative"
                    >
                        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden relative">
                            <img
                                src="/buffet.jpg"
                                alt="Commercial kitchen buffet"
                                className="w-full h-72 lg:h-80 object-cover"
                            />
                            <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />
                            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
                                    <div className="text-xs font-bold text-primary">-34%</div>
                                    <div className="text-[10px] text-muted-foreground">Waste reduced</div>
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
                                    <div className="text-xs font-bold text-foreground">127</div>
                                    <div className="text-[10px] text-muted-foreground">Meals saved</div>
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
                                    <div className="text-xs font-bold text-foreground">P12.4k</div>
                                    <div className="text-[10px] text-muted-foreground">Cost savings</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* The Problem */}
            <section className="relative border-y border-border overflow-hidden">
                <img src="/foods.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-background/92" />
                <div className="relative max-w-6xl mx-auto px-6 py-16">
                    <motion.div
                        className="text-center mb-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">The problem we solve</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Food waste is a massive global issue — and commercial kitchens are a major contributor.
                            Most excess happens because of poor planning, not carelessness.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: TrendingDown, value: "1.3 Billion", label: "Tons of food wasted globally each year", color: "text-destructive" },
                            { icon: DollarSign, value: "P1.5T+", label: "Annual economic losses from food waste worldwide", color: "text-destructive" },
                            { icon: AlertTriangle, value: "30-40%", label: "Of food in commercial kitchens becomes excess", color: "text-destructive" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="text-center p-6 rounded-xl bg-card border border-border shadow-sm"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                variants={fadeUp}
                            >
                                <stat.icon size={28} className={`mx-auto mb-3 ${stat.color}`} />
                                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="mt-8 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={3}
                        variants={fadeUp}
                    >
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            The root cause? Kitchens rely on guesswork for production quantities.
                            Without data, they overproduce to avoid running out — creating consistent,
                            preventable waste.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                        System features
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Consensus provides a complete toolkit for managing food production and minimizing excess.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-5">
                    {[
                        {
                            icon: ChefHat,
                            title: "Product Catalog Management",
                            desc: "Maintain a digital catalog of all dishes with batch sizes, units, categories, and dish types. Supports solid, liquid, and mixed-format products.",
                        },
                        {
                            icon: Layers,
                            title: "Smart Production Planning",
                            desc: "Create named production plans with selected products, target quantities, and scheduled end times. Plans adapt over time based on AI feedback.",
                        },
                        {
                            icon: Clock,
                            title: "Real-Time Session Tracking",
                            desc: "Start timed production sessions tied to plans. Monitor what is being produced and when the session ends — manually or automatically.",
                        },
                        {
                            icon: Recycle,
                            title: "Excess Audit and Logging",
                            desc: "After each session, log leftover quantities with condition tracking (sellable, repurposable, discard) and disposition (donated, composted, etc).",
                        },
                        {
                            icon: Sparkles,
                            title: "AI-Powered Recommendations",
                            desc: "Get intelligent quantity adjustments based on historical excess patterns. The AI learns from each session to suggest better production targets.",
                        },
                        {
                            icon: BarChart3,
                            title: "Insights and Analytics",
                            desc: "Visualize waste trends, cost savings, and production efficiency over time. Identify which products consistently overproduce.",
                        },
                    ].map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={i}
                            variants={fadeUp}
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <feature.icon size={20} className="text-primary" />
                            </div>
                            <h3 className="font-bold text-foreground mb-1.5">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="border-y border-border bg-secondary/20">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">How it works</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">A continuous improvement cycle in four steps.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: "1", title: "Catalog", desc: "Add your kitchen products with batch sizes and units" },
                            { step: "2", title: "Plan", desc: "Create a production plan, set quantities and end time" },
                            { step: "3", title: "Produce", desc: "Run a timed session and serve your customers" },
                            { step: "4", title: "Audit", desc: "Log excess, get AI recommendations for next time" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                className="text-center"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                variants={fadeUp}
                            >
                                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                                    {item.step}
                                </div>
                                <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                {i < 3 && (
                                    <div className="hidden md:block mt-4 text-muted-foreground/40 text-lg">
                                        <ArrowRight size={20} className="mx-auto" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        className="text-center text-sm text-muted-foreground mt-10 max-w-lg mx-auto"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={4}
                        variants={fadeUp}
                    >
                        Each cycle feeds data back into the system. Over time, AI recommendations
                        become more accurate, driving continuous waste reduction.
                    </motion.p>
                </div>
            </section>

            {/* Technologies */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">Built with modern tech</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        A robust, scalable stack designed for reliability and speed.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-5">
                    <motion.div
                        className="p-5 rounded-xl border border-border bg-card shadow-sm"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={0}
                        variants={fadeUp}
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                            <Globe size={20} className="text-blue-700" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Frontend</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {["React 19", "Tailwind CSS 4", "Framer Motion", "Recharts", "shadcn/ui", "Vite"].map((tech) => (
                                <span key={tech} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-5 rounded-xl border border-border bg-card shadow-sm"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={1}
                        variants={fadeUp}
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                            <Cpu size={20} className="text-green-700" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Backend</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {["Node.js", "Express 5", "Prisma ORM", "PostgreSQL", "Supabase", "JWT Auth"].map((tech) => (
                                <span key={tech} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-5 rounded-xl border border-border bg-card shadow-sm"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={2}
                        variants={fadeUp}
                    >
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                            <Sparkles size={20} className="text-purple-700" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">AI / Intelligence</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {["Pattern Analysis", "Historical Trending", "Quantity Optimization", "Waste Prediction"].map((tech) => (
                                <span key={tech} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-5 rounded-xl border border-border bg-card shadow-sm"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={3}
                        variants={fadeUp}
                    >
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                            <Database size={20} className="text-amber-700" />
                        </div>
                        <h3 className="font-bold text-foreground mb-2">Infrastructure</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {["Docker", "Supabase Cloud", "REST API", "Zod Validation", "File Storage"].map((tech) => (
                                <span key={tech} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Who we help */}
            <section className="relative border-y border-border overflow-hidden">
                <img src="/street-food.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-background/92" />
                <div className="relative max-w-6xl mx-auto px-6 py-20">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                            How we help food businesses
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Any kitchen that produces food at scale can benefit from data-driven production management.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-5 mb-10">
                        {[
                            { icon: Utensils, title: "Restaurants", desc: "Reduce daily overproduction and cut food costs" },
                            { icon: Building2, title: "Catering", desc: "Plan event quantities with precision" },
                            { icon: Store, title: "Canteens", desc: "Match output to actual headcount patterns" },
                            { icon: Truck, title: "Cloud Kitchens", desc: "Optimize multi-brand production runs" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                className="text-center p-5 rounded-xl border border-border bg-card shadow-sm"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                variants={fadeUp}
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <item.icon size={20} className="text-primary" />
                                </div>
                                <h4 className="font-bold text-foreground text-sm mb-1">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-5"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={4}
                        variants={fadeUp}
                    >
                        {[
                            { icon: DollarSign, title: "Cut costs", desc: "Reduce raw material waste and save on procurement" },
                            { icon: Leaf, title: "Reduce environmental impact", desc: "Less food waste means lower carbon emissions" },
                            { icon: Users, title: "Enable redistribution", desc: "Identify surplus early enough to donate instead of discard" },
                        ].map((benefit) => (
                            <div key={benefit.title} className="flex gap-3 p-4 rounded-lg bg-card border border-border">
                                <benefit.icon size={18} className="text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-foreground mb-0.5">{benefit.title}</div>
                                    <div className="text-xs text-muted-foreground leading-relaxed">{benefit.desc}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <motion.div
                    className="text-center rounded-2xl bg-card border border-border shadow-sm p-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <ShieldCheck size={32} className="mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Ready to reduce waste?</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start making data-driven production decisions today.
                    </p>
                    <Link to="/dashboard">
                        <Button size="lg" className="gap-2 px-8">
                           Get Started
                            <ArrowRight size={16} />
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-linear-to-br from-primary to-teal-800 flex items-center justify-center shadow-sm">
                            <Leaf size={11} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-primary tracking-wide">Consensus</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                        Built for SDG 12 — Responsible Consumption and Production
                    </div>
                </div>
            </footer>
        </div>
    );
}
