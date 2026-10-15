'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, CheckCircle2, Film } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MaskedText } from '../ui/masked-text';
import { Reveal } from '../reveal';

interface ProductFilmProps {
  onStartOnboarding?: () => void;
}

const SCENE_CHAPTERS = [
  { id: 1, time: 0, label: '01: Ingestion', title: 'Universal Ingestion' },
  { id: 2, time: 6, label: '02: Extraction', title: 'Line Item Extraction' },
  { id: 3, time: 12, label: '03: Verification', title: '4-Truth Reconciliation' },
  { id: 4, time: 18, label: '04: Intelligence', title: 'Financial Forecasts' },
  { id: 5, time: 25, label: '05: Command', title: 'Portfolio Command Center' },
];

export function ProductFilm({ onStartOnboarding }: ProductFilmProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [activeChapter, setActiveChapter] = useState(SCENE_CHAPTERS[0]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user system reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }

    // Attempt video playback
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);

      // Find matching chapter
      const chapter = [...SCENE_CHAPTERS].reverse().find((c) => t >= c.time) || SCENE_CHAPTERS[0];
      setActiveChapter(chapter);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 30);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const seekToChapter = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section 
      id="product-film" 
      className="relative border-b border-border bg-card/40 py-16 sm:py-20 lg:py-24 overflow-hidden"
      aria-labelledby="product-film-heading"
    >
      {/* Background blueprint decorative pattern */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            <Film className="size-3.5 text-foreground" aria-hidden="true" />
            <span>Product demonstration: 30-second architectural overview</span>
          </div>
          <h2 id="product-film-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <MaskedText as="span">
              From scattered documents to financial intelligence.
            </MaskedText>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Watch GroundUp ingest construction paperwork, extract line items, enforce 10% retainage withholdings, and synchronize budget, spend, physical progress, and bank draws in real time.
          </p>
        </div>

        {/* Video Cinema Showcase Player */}
        <Reveal delay={80}>
          <div
            ref={containerRef}
            className="group relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl shadow-primary/5 transition-all duration-300"
          >
          {/* Top Architectural HUD Bar (Zero AI signal gimmick) */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 sm:px-6 py-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold tracking-wide text-foreground uppercase">
                Demo: {activeChapter.title}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-muted-foreground font-mono text-[11px]">
              <span>Resolution: 1080p</span>
              <span>•</span>
              <span>Asset: 73 Broadway ($4.2M Loan)</span>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
            <video
              ref={videoRef}
              src="/videos/groundup-processing-demo.mp4"
              poster="/videos/groundup-processing-demo-poster.jpg"
              playsInline
              autoPlay={!reducedMotion}
              muted={isMuted}
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="h-full w-full object-cover"
              aria-label="GroundUp AI 30-Second Product Demonstration Video"
            />

            {/* Centered Play Button when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label="Play product demonstration film"
                className="absolute inset-0 m-auto size-16 sm:size-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-105 transition-all cursor-pointer z-10 border border-white/20"
              >
                <Play className="size-7 sm:size-8 fill-current translate-x-0.5" />
              </button>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-black/20 p-4 sm:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Progress Scrubber */}
              <div
                className="relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2.5"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current) {
                    videoRef.current.currentTime = pos * duration;
                  }
                }}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Lower Control Bar */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-white/80">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden md:inline font-mono text-[11px] text-emerald-400 font-semibold">
                    {activeChapter.label}
                  </span>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label="Toggle fullscreen"
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chapter Markers */}
          <div className="border-t border-border/80 bg-background/95 p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SCENE_CHAPTERS.map((chapter) => {
                const isActive = activeChapter.id === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => seekToChapter(chapter.time)}
                    className={cn(
                      'btn-micro flex flex-col text-left p-2 rounded-lg transition-all border cursor-pointer',
                      isActive
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                        : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span className="font-mono text-[10px] font-semibold uppercase">
                      {chapter.label.split(':')[0]}
                    </span>
                    <span className="text-xs font-semibold truncate mt-0.5">
                      {chapter.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Clean Outcome Strip (Zero Pushy CTA clutter) */}
      <Reveal delay={140} className="mt-8">
        <div className="rounded-xl border border-border bg-card/60 p-4 sm:p-5 text-center max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AIA Document A201: Standard 10% Retainage Withholding</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>California Civil Code 8132: Statutory Progress Lien Waivers</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AIA G702 / G703: Lender-Ready Bank Draw Package Assembly</span>
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
  );
}

export default ProductFilm;
