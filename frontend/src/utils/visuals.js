export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const slideInRight = {
    hidden: { x: 50, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

export const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3 }
    }
};
export const IMAGES = {
    // Analytics/Dashboard interface
    DASHBOARD_HEADER: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",

    // Detailed woven fabric texture
    FABRIC_TEXTURE: "https://images.unsplash.com/photo-1520975922203-b7d3c7d7c9a5?auto=format&fit=crop&w=1600&q=80",

    // Factory worker/engineer on the floor
    WORKER_HERO: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",

    // Heavy industrial machinery/gears
    MACHINERY: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",

    // Clean, modern abstract background
    ABSTRACT_BG: "https://images.unsplash.com/photo-1771345207864-2f0016374a0a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    // Accounting/finance spreadsheet and calculator

    // Large warehouse aisles and inventory racking
    INVENTORY_SHELVES: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=80"
};
