import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function MainHeading({ title, description, className }: { title: string; description?: string; className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setScrollPosition(window.innerHeight - rect.top);
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const splitDescription = (desc: string, linesPerPart: number) => {
        const lines = desc.split('.');
        const parts: string[] = [];
        for (let i = 0; i < lines.length; i += linesPerPart) {
            parts.push(lines.slice(i, i + linesPerPart).join('.'));
            if (i < lines.length - 1) parts[parts.length - 1] += '.';
        }
        return parts;
    };

    const descriptionParts = description ? splitDescription(description, 1) : [];

    return (
        <div ref={containerRef} className={`text-left mt-96 ${className || ''}`}>
            <motion.h1 className="text-6xl font-semibold">{title}</motion.h1>
            {descriptionParts.length > 0 && (
                <motion.div
                    className="text-slate mt-24 text-3xl leading-[75px] max-w-5xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: scrollPosition > 0 ? 1 : 0 }}
                    transition={{ duration: 1 }}
                >
                    {descriptionParts.map((part, index) => {
                        const startFade = index * 200;
                        const endFade = startFade + 400;
                        const intensity = scrollPosition > startFade
                            ? Math.min(1, (scrollPosition - startFade) / (endFade - startFade))
                            : 0;

                        return (
                            <motion.span
                                key={index}
                                style={{ color: `rgba(0, 0, 0, ${intensity})`, transition: 'color 0.5s ease', whiteSpace: 'pre-wrap' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.3 }}
                            >
                                {part}
                            </motion.span>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
