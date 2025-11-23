// frontend/src/components/Header.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Header({
    onSearch,
    recent = [],
    defaultTicker = "AAPL",
}) {
    const [val, setVal] = React.useState((defaultTicker || "").toUpperCase());
    const [days, setDays] = React.useState(7);

    React.useEffect(() => {
        setVal((defaultTicker || "").toUpperCase());
    }, [defaultTicker]);

    const submit = () => {
        const t = (val || "").trim().toUpperCase();
        if (!t) return;
        onSearch?.(t, days);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") submit();
    };

    // Animation variants for Framer Motion
    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        // Added pt-8 for top padding, used a dark border for separation
        <motion.header
            className="flex flex-col items-center gap-2 mb-8 pt-8 pb-4 border-b border-gray-700/50"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="text-center"> 
                {/* Applied motion to the main title */}
                <motion.div
                    className="text-4xl font-extrabold tracking-tight text-white pb-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.4 } }}
                >
                    FinSight AI
                </motion.div>
                
                {/* Subtitle with accent color and glow */}
                <motion.div
                    className="text-sm font-light text-indigo-400 dark:text-indigo-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.4 } }}
                    style={{ textShadow: '0 0 5px rgba(167, 139, 250, 0.4)' }} // Subtle glow effect
                >
                    Stocks • Sentiment • Risk — powered by models
                </motion.div>
            </div>
            {/* If you add a search bar here later, it will also be centered */}
        </motion.header>
    );
}