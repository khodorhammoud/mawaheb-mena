import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ZoomingText from './ZoomingText';

/** wrapper that only snaps itself to centre */
const ZoomingTextSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && ref.current) {
          const top = ref.current.getBoundingClientRect().top + window.scrollY;
          const target = top - window.innerHeight / 2 + ref.current.offsetHeight / 2;
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      },
      { threshold: 0.1 }
    );
    ref.current && obs.observe(ref.current);
    return () => ref.current && obs.unobserve(ref.current);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center my-48 overflow-visible"
      style={{ minHeight: '120vh' }}
    >
      {/* <ZoomingText /> */}
    </motion.div>
  );
};

export default ZoomingTextSection;
