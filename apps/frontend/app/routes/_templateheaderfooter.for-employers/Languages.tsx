// apps/frontend/app/common/profileView/Languages.tsx
import { motion, useTransform, useMotionValue, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import ZoomingText from './ZoomingText';

interface PreWhatTheySayAboutUs {
  content: string;
}
interface LoaderData {
  preWhatTheySayAboutUs: PreWhatTheySayAboutUs;
}

const ZOOM_MAX = 200;
const AUTO_MS = 1400;
const REVERSE_MS = 1100;

export default function Languages() {
  const { preWhatTheySayAboutUs } = useLoaderData<LoaderData>();

  const sectionRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const tweenRunningRef = useRef(false);
  const forwardDoneRef = useRef(false);
  const fullZoomRef = useRef(false);
  const lastScrollRef = useRef(0);

  const scrollY = useMotionValue(0);

  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  const fadeOpacity = useTransform(scrollY, [0, 10], [1, 0], {
    clamp: true,
  });
  const zoomScale = useTransform(scrollY, [10, ZOOM_MAX], [0, 1], {
    clamp: true,
  });
  const zoomOpacity = useTransform(scrollY, [10, ZOOM_MAX], [0, 1], {
    clamp: true,
  });

  function lockWheelTouch() {
    const stop = (e: Event) => e.preventDefault();
    window.addEventListener('wheel', stop, { passive: false });
    window.addEventListener('touchmove', stop, { passive: false });
    return () => {
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
    };
  }

  function runTween(from: number, to: number, ms: number, done: () => void) {
    if (tweenRunningRef.current) return;
    tweenRunningRef.current = true;
    const unlock = lockWheelTouch();

    animate(from, to, {
      duration: ms / 1000,
      ease: [0.4, 0.0, 0.2, 1], // Optimized ease for smooth animation
      onUpdate: v => {
        window.scrollTo({ top: v, behavior: 'auto' });
        scrollY.set(v - targetRef.current);
      },
      onComplete: () => {
        unlock();
        tweenRunningRef.current = false;
        requestAnimationFrame(done);
      },
    });
  }

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (!e.isIntersecting) {
          setPhase(0);
          setPinned(false);
          forwardDoneRef.current = false;
          fullZoomRef.current = false;
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px',
      }
    );

    if (sectionRef.current) {
      io.observe(sectionRef.current);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    const THROTTLE = 1000 / 60; // 60fps

    const onScroll = () => {
      const now = performance.now();
      if (now - lastTime < THROTTLE) {
        return;
      }
      lastTime = now;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!sectionRef.current || !visible || tweenRunningRef.current) return;

        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollRef.current) < 0.5) return;
        lastScrollRef.current = currentScroll;

        const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        const targetY = top - window.innerHeight / 2 + sectionRef.current.offsetHeight / 2;
        targetRef.current = targetY;

        if (!pinned) {
          runTween(window.scrollY, targetY, 600, () => setPinned(true));
          return;
        }

        const delta = window.scrollY - targetY;
        if (delta >= 0) {
          scrollY.set(delta);
        }

        if (delta >= 30 && phase === 0) setPhase(1);
        if (delta >= 60 && phase === 1) setPhase(2);

        if (phase === 1 && !forwardDoneRef.current) {
          forwardDoneRef.current = true;
          runTween(window.scrollY, targetY + ZOOM_MAX, AUTO_MS, () => {
            fullZoomRef.current = true;
          });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [visible, pinned, phase]);

  useEffect(() => {
    let lastWheelTime = performance.now();
    const WHEEL_THROTTLE = 100;

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now - lastWheelTime < WHEEL_THROTTLE) return;
      lastWheelTime = now;

      if (!fullZoomRef.current || tweenRunningRef.current) return;

      if (e.deltaY < 0) {
        e.preventDefault();
        fullZoomRef.current = false;
        runTween(window.scrollY, targetRef.current, REVERSE_MS, () => {
          forwardDoneRef.current = false;
          setPhase(0);
        });
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchmove', onWheel as any, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onWheel as any);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = 'auto';
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        ref={sectionRef}
        initial={{ opacity: 1, y: 0 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        className="flex flex-col items-center justify-center gap-8 lg:text-3xl text-2xl my-48 font-semibold font-['BespokeSerif-Variable'] lg:w-[650px] mx-auto"
        style={{
          minHeight: 'calc(120vh - 100px)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          transform: 'translate3d(0,0,0)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
          style={{
            opacity: fadeOpacity,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            transform: 'translate3d(0,0,0)',
          }}
        >
          <p className="text-center">{preWhatTheySayAboutUs.content.split('\n')[0]}</p>
          <p className="text-center">{preWhatTheySayAboutUs.content.split('\n')[1]}</p>
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            scale: zoomScale,
            opacity: zoomOpacity,
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            transform: 'translate3d(0,0,0)',
          }}
          className="text-4xl font-['BespokeSerif-Variable']"
        >
          <ZoomingText scrollY={scrollY} />
        </motion.div>
      </motion.div>
    </div>
  );
}
