import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

const KINETIC = {
  surface: '#0c0f0f',
  surfaceContainer: '#1e2020',
  surfaceContainerLow: '#121414',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#c8c6c5',
  primary: '#ff571a',
  primarySoft: '#ffb59e',
  outline: 'rgba(255, 255, 255, 0.1)',
};

// Curated Unsplash gym/fitness images — direct image URLs, no API key needed.
// Each has a unique Unsplash photo ID so they load independently and fast.
const GALLERY = [
  {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop',
    label: 'Iron Room',
    span: 'tall',   // tall left feature
  },
  {
    url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80&auto=format&fit=crop',
    label: 'Performance Zone',
    span: 'normal',
  },
  {
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&auto=format&fit=crop',
    label: 'Strength Floor',
    span: 'normal',
  },
  {
    url: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&q=80&auto=format&fit=crop',
    label: 'Cardio Arena',
    span: 'normal',
  },
  {
    url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80&auto=format&fit=crop',
    label: 'Recovery Suite',
    span: 'wide',   // wide bottom feature
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const GalleryCard = ({ item, delay, inView }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        opacity: inView ? 1 : 0,
        transform: inView ? 'scale(1)' : 'scale(0.96)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        cursor: 'crosshair',
        // span logic handled by parent grid
      }}
    >
      {/* Image */}
      <Box
        component="img"
        src={item.url}
        alt={item.label}
        loading="lazy"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform 0.7s ease',
          filter: hovered ? 'brightness(0.5)' : 'brightness(0.75)',
        }}
      />

      {/* Label */}
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        p: '20px 24px',
        background: 'linear-gradient(0deg, rgba(12,15,15,0.9) 0%, transparent 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <Typography sx={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: hovered ? KINETIC.primarySoft : 'rgba(226,226,226,0.7)',
          transition: 'color 0.3s ease',
        }}>
          {item.label}
        </Typography>

        {/* Small crosshair icon on hover */}
        <Box sx={{
          width: '20px',
          height: '20px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            backgroundColor: KINETIC.primarySoft,
          },
          '&::before': {
            width: '1px',
            height: '100%',
            left: '50%',
            top: 0,
          },
          '&::after': {
            height: '1px',
            width: '100%',
            top: '50%',
            left: 0,
          },
        }} />
      </Box>

      {/* Orange top-left corner accent on hover */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: hovered ? '48px' : '0px',
        height: '2px',
        backgroundColor: KINETIC.primary,
        transition: 'width 0.4s ease',
      }} />
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '2px',
        height: hovered ? '48px' : '0px',
        backgroundColor: KINETIC.primary,
        transition: 'height 0.4s ease',
      }} />
    </Box>
  );
};

const GymGallerySection = () => {
  const [sectionRef, sectionInView] = useInView(0.08);

  return (
    <Box
      component="section"
      ref={sectionRef}
      sx={{
        backgroundColor: KINETIC.surface,
        pt: { xs: '72px', md: '108px' },
        pb: { xs: '72px', md: '108px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top orange glow */}
      <Box sx={{
        position: 'absolute',
        top: '-40px',
        left: '30%',
        width: '40%',
        height: '160px',
        background: 'radial-gradient(ellipse, rgba(255,87,26,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: '24px', md: '64px' }, position: 'relative' }}>

        {/* Section header */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: '24px',
          mb: { xs: '48px', md: '64px' },
        }}>
          <Box>
            <Typography sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: KINETIC.primary,
              mb: '12px',
            }}>
              The Space
            </Typography>
            <Typography sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: { xs: '36px', md: '56px' },
              fontWeight: 900,
              fontStyle: 'italic',
              lineHeight: 1.0,
              color: KINETIC.onSurface,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
            }}>
              WHERE LIMITS<br />
              <span style={{ color: KINETIC.primarySoft }}>GET LEFT</span><br />
              BEHIND
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '16px',
            lineHeight: '28px',
            color: KINETIC.onSurfaceVariant,
            maxWidth: '360px',
          }}>
            State-of-the-art equipment, dedicated training zones, and an atmosphere engineered
            to pull your best performance out of you — every single session.
          </Typography>
        </Box>

        {/* Gallery grid — CSS grid for the editorial layout */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gridTemplateRows: { md: '340px 240px' },
          gap: '12px',
        }}>

          {/* Card 0 — tall left (spans 2 rows on desktop) */}
          <Box sx={{
            gridColumn: { md: '1 / 2' },
            gridRow: { md: '1 / 3' },
            minHeight: { xs: '280px', md: 'auto' },
          }}>
            <GalleryCard item={GALLERY[0]} delay={0} inView={sectionInView} />
          </Box>

          {/* Card 1 */}
          <Box sx={{ minHeight: { xs: '220px', md: 'auto' } }}>
            <GalleryCard item={GALLERY[1]} delay={0.1} inView={sectionInView} />
          </Box>

          {/* Card 2 */}
          <Box sx={{ minHeight: { xs: '220px', md: 'auto' } }}>
            <GalleryCard item={GALLERY[2]} delay={0.2} inView={sectionInView} />
          </Box>

          {/* Card 3 */}
          <Box sx={{ minHeight: { xs: '220px', md: 'auto' } }}>
            <GalleryCard item={GALLERY[3]} delay={0.3} inView={sectionInView} />
          </Box>

          {/* Card 4 — wide bottom right (spans 2 cols on desktop) */}
          <Box sx={{
            gridColumn: { md: '3 / 4' },
            gridRow: { md: '2 / 3' },
            minHeight: { xs: '220px', md: 'auto' },
          }}>
            <GalleryCard item={GALLERY[4]} delay={0.4} inView={sectionInView} />
          </Box>
        </Box>

        {/* Bottom caption */}
        <Typography sx={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(226,226,226,0.25)',
          textAlign: 'right',
          mt: '16px',
        }}>
          Training Facility — KINETIC Performance Center
        </Typography>

      </Box>
    </Box>
  );
};

export default GymGallerySection;