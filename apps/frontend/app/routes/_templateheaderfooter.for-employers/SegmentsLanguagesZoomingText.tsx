import {
  motion,
  useTransform,
  useMotionValue,
  animate,
  MotionValue,
  AnimatePresence,
} from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import Testimonials from './Testimonials';

// --- TYPES ---
interface HowItWorksItem {
  content: string;
}
interface PreWhatTheySayAboutUs {
  content: string;
}
interface LoaderData {
  postHowItWorks: { content: string };
  preWhatTheySayAboutUs: { content: string };
}

// --- ZOOMING TEXT COMPONENT (as child) ---
interface ZoomingTextProps {
  scrollY: MotionValue<number>;
  fingerIconPosition?: { top?: string; left?: string; right?: string; bottom?: string };
}
const ZoomingText: React.FC<ZoomingTextProps> = ({ scrollY, fingerIconPosition }) => {
  const [showFingerIcon, setShowFingerIcon] = useState(false);

  // Responsive position values
  const [positionYP1Value, setPositionYP1Value] = useState('40vh');
  const [positionYP2Value, setPositionYP2Value] = useState('40vh');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        setPositionYP1Value('40vh');
        setPositionYP2Value('30vh');
      } else if (window.innerWidth > 800) {
        setPositionYP1Value('30vh');
        setPositionYP2Value('20vh');
      } else {
        setPositionYP1Value('20vh');
        setPositionYP2Value('10vh');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scale and position transformations
  const zoomScaleP1 = useTransform(scrollY, [30, 200], [0.6, 1]);
  const positionYP1 = useTransform(scrollY, [30, 200], [positionYP1Value, '5vh']);
  const zoomScaleP2 = useTransform(scrollY, [30, 200], [0.6, 1]);
  const positionYP2 = useTransform(scrollY, [30, 200], [positionYP2Value, '-5vh']);
  const zoomScaleTestimonials = useTransform(scrollY, [30, 200], [0.4, 0.6]);
  const opacityTestimonials = useTransform(scrollY, [150, 200], [0, 1]);

  return (
    <div className="flex flex-col items-center justify-between overflow-visible min-h-screen">
      {/* Finger Icon */}
      <AnimatePresence>
        {showFingerIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10"
            style={{
              top: fingerIconPosition?.top || '910px',
              left: fingerIconPosition?.left || '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div className="text-4xl bg-slate-100 rounded-2xl p-2 text-white fill-white stroke-black">
              <div className="inline-block fingerAnimation">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 42 42"
                  className=""
                >
                  <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 13.09375 28.21875 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.p
          style={{ scale: zoomScaleP1, y: positionYP1 }}
          className="text-center text-5xl font-bold"
        >
          WHAT THEY SAY
        </motion.p>
        <motion.div style={{ scale: zoomScaleTestimonials, opacity: opacityTestimonials }}>
          <Testimonials setShowFingerIcon={setShowFingerIcon} />
        </motion.div>
        <motion.p
          style={{ scale: zoomScaleP2, y: positionYP2 }}
          className="text-center text-5xl font-bold 2xl:mt-[5vh]"
        >
          ABOUT US
        </motion.p>
      </motion.div>
    </div>
  );
};

const ZOOM_MAX = 200;
const AUTO_MS = 1400;
const REVERSE_MS = 1100;

// --- COMBINED COMPONENT ---
export default function SegmentsLanguagesZoomingText() {
  const { postHowItWorks, preWhatTheySayAboutUs } = useLoaderData<LoaderData>();

  // --- Segments logic ---
  const segmentsRef = useRef<HTMLDivElement>(null);
  const [segmentsInView, setSegmentsInView] = useState(false);
  const segmentsHasScrolled = useRef(false);
  const segmentsPinPosition = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setSegmentsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (segmentsRef.current) observer.observe(segmentsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updatePin = () => {
      if (segmentsRef.current) {
        const rect = segmentsRef.current.getBoundingClientRect();
        segmentsPinPosition.current =
          rect.top + window.scrollY - window.innerHeight / 2 + segmentsRef.current.offsetHeight / 2;
      }
    };
    updatePin();
    window.addEventListener('resize', updatePin);
    return () => window.removeEventListener('resize', updatePin);
  }, []);

  useEffect(() => {
    if (segmentsInView && !segmentsHasScrolled.current && segmentsPinPosition.current !== null) {
      segmentsHasScrolled.current = true;
      window.scrollTo({ top: segmentsPinPosition.current, behavior: 'smooth' });
    }
    if (!segmentsInView) segmentsHasScrolled.current = false;
  }, [segmentsInView]);

  const segmentLines = (postHowItWorks?.content ?? '')
    .split('\n')
    .filter(line => line.trim() !== '');

  // --- Languages logic ---
  const languagesRef = useRef<HTMLDivElement>(null);
  const languagesTargetRef = useRef(0);
  const tweenRunningRef = useRef(false);
  const forwardDoneRef = useRef(false);
  const fullZoomRef = useRef(false);
  const lastScrollRef = useRef(0);

  const scrollY = useMotionValue(0);
  const [languagesVisible, setLanguagesVisible] = useState(false);
  const [languagesPinned, setLanguagesPinned] = useState(false);
  const [languagesPhase, setLanguagesPhase] = useState<0 | 1 | 2>(0);

  // ---- NEW FOR ANIMATION ----
  const [leavingZoom, setLeavingZoom] = useState(false);
  const prevPhase = useRef<0 | 1 | 2>(0);

  useEffect(() => {
    if (prevPhase.current === 2 && languagesPhase < 2) {
      setLeavingZoom(true);
      setTimeout(() => setLeavingZoom(false), 500); // match transition duration
    }
    prevPhase.current = languagesPhase;
  }, [languagesPhase]);

  const fadeOpacity = useTransform(scrollY, [0, 10], [1, 0], { clamp: true });
  const zoomScale = useTransform(scrollY, [10, ZOOM_MAX], [0, 1], { clamp: true });
  const zoomOpacity = useTransform(scrollY, [10, ZOOM_MAX], [0, 1], { clamp: true });

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
    if (Math.abs(from - to) < 30) {
      scrollY.set(0);
      done();
      return;
    }
    if (tweenRunningRef.current) return;
    tweenRunningRef.current = true;
    const unlock = lockWheelTouch();
    animate(from, to, {
      duration: ms / 1000,
      ease: [0.4, 0.0, 0.2, 1],
      onUpdate: v => {
        window.scrollTo({ top: v, behavior: 'auto' });
        scrollY.set(v - languagesTargetRef.current);
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
        setLanguagesVisible(e.isIntersecting);
        if (!e.isIntersecting) {
          setLanguagesPhase(0);
          setLanguagesPinned(false);
          forwardDoneRef.current = false;
          fullZoomRef.current = false;
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    );
    if (languagesRef.current) io.observe(languagesRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();
    const THROTTLE = 1000 / 60;
    const onScroll = () => {
      const now = performance.now();
      if (now - lastTime < THROTTLE) return;
      lastTime = now;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!languagesRef.current || !languagesVisible || tweenRunningRef.current) return;
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollRef.current) < 25) return;

        lastScrollRef.current = currentScroll;
        const top = languagesRef.current.getBoundingClientRect().top + window.scrollY;
        const targetY = top - window.innerHeight / 2 + languagesRef.current.offsetHeight / 2;
        languagesTargetRef.current = targetY;
        if (!languagesPinned) {
          runTween(window.scrollY, targetY, 600, () => setLanguagesPinned(true));
          return;
        }
        const delta = window.scrollY - targetY;
        if (delta >= 0) scrollY.set(delta);
        // Animate out text, then animate in zoom
        if (delta >= 30 && languagesPhase === 0) setLanguagesPhase(1);
        if (delta >= 60 && languagesPhase === 1) setLanguagesPhase(2);
        if (languagesPhase === 1 && !forwardDoneRef.current) {
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
  }, [languagesVisible, languagesPinned, languagesPhase]);

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
        runTween(window.scrollY, languagesTargetRef.current, REVERSE_MS, () => {
          forwardDoneRef.current = false;
          setLanguagesPhase(0);
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

  const languageLines = (preWhatTheySayAboutUs?.content ?? '').split('\n');

  // --- RENDER ---
  return (
    <>
      {/* Segments section */}
      <motion.div
        ref={segmentsRef}
        initial={{ opacity: 0, y: 40 }}
        animate={segmentsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center justify-center gap-8 mt-[200px] lg:text-7xl text-5xl font-semibold font-['BespokeSerif-Variable'] lg:w-[850px] mx-auto"
        style={{ minHeight: 'calc(120vh - 400px)' }}
      >
        {segmentLines.map((line, i) => (
          <p className="text-center" key={i}>
            {line}
          </p>
        ))}
      </motion.div>

      {/* Languages section with crossfade animation between text and ZoomingText */}
      <div>
        <motion.div
          ref={languagesRef}
          initial={{ opacity: 1, y: 0 }}
          animate={languagesVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
          className="flex flex-col items-center justify-center gap-8 lg:text-3xl text-2xl my-48 font-semibold font-['BespokeSerif-Variable'] lg:w-[650px] mx-auto"
          style={{
            minHeight: 'calc(120vh - 100px)',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            transform: 'translate3d(0,0,0)',
            position: 'relative',
          }}
        >
          <AnimatePresence>
            {/* Show lines if not phase 2, unless leavingZoom is true */}
            {languagesPhase < 2 && !leavingZoom && (
              <motion.div
                key="lines"
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04, y: -28 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  opacity: fadeOpacity,
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  perspective: 1000,
                  transform: 'translate3d(0,0,0)',
                }}
              >
                <p className="text-center">{languageLines[0]}</p>
                <p className="text-center">{languageLines[1]}</p>
              </motion.div>
            )}
            {/* Show ZoomingText if phase 2 or we're leaving */}
            {(languagesPhase === 2 || leavingZoom) && (
              <motion.div
                key="zoom"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  scale: zoomScale,
                  opacity: zoomOpacity,
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  perspective: 1000,
                }}
                className="text-4xl font-['BespokeSerif-Variable']"
              >
                <ZoomingText scrollY={scrollY} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
