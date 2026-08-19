import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Typography, Grid } from '@mui/material';

// Identical theme tokens as FeaturesSection.js
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

const PILLARS = [
  {
    number: '01',
    title: 'Science-Backed Programming',
    body: 'Every routine is grounded in exercise physiology — progressive overload, muscle group rotation, and recovery windows built into the plan.',
    accent: '#ff571a',
  },
  {
    number: '02',
    title: 'Macro Precision',
    body: 'Real-time calorie and macro tracking that adapts to your goal — cut, bulk, or maintain — with a 200-item food database ready out of the box.',
    accent: '#ff571a',
  },
  {
    number: '03',
    title: 'Zero Fluff. All Signal.',
    body: 'No social feeds, no streaks, no gamification gimmicks. Just clean data, honest progress, and the tools serious athletes actually need.',
    accent: '#ff571a',
  },
  {
    number: '04',
    title: 'Built for the Long Game',
    body: 'Track BMI, set nutrition targets, and revisit your history. Kinetic is designed to grow with you across seasons and training cycles.',
    accent: '#ff571a',
  },
];

// Simple hook for scroll-triggered reveal
function useInView(threshold = 0.15) {
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

const WhyKineticSection = () => {
  const [sectionRef, sectionInView] = useInView(0.1);

  return (
    <Box
      component="section"
      ref={sectionRef}
      sx={{
        backgroundColor: KINETIC.surfaceContainerLow,
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: '72px', md: '108px' },
        pb: { xs: '72px', md: '108px' },
      }}
    >
      {/* Subtle diagonal stripe texture */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          -55deg,
          rgba(255,87,26,0.018) 0px,
          rgba(255,87,26,0.018) 1px,
          transparent 1px,
          transparent 60px
        )`,
        pointerEvents: 'none',
      }} />

      {/* Red glow bottom-right */}
      <Box sx={{
        position: 'absolute',
        bottom: '-60px',
        right: '-60px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,87,26,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: '24px', md: '64px' }, position: 'relative' }}>

        {/* Two-column header: label left, heading right */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          justifyContent: 'space-between',
          gap: '32px',
          mb: { xs: '56px', md: '80px' },
          pb: '40px',
          borderBottom: `1px solid ${KINETIC.outline}`,
        }}>
          <Box sx={{ flex: '0 0 auto' }}>
            <Typography sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: KINETIC.primary,
              mb: '16px',
            }}>
              Why Kinetic
            </Typography>
            <Typography sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: { xs: '36px', md: '60px' },
              fontWeight: 900,
              fontStyle: 'italic',
              lineHeight: 1.0,
              color: KINETIC.onSurface,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              maxWidth: '420px',
            }}>
              BUILT FOR<br />
              <span style={{ color: KINETIC.primarySoft }}>ATHLETES,</span><br />
              NOT CASUAL
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: '16px',
            lineHeight: '28px',
            color: KINETIC.onSurfaceVariant,
            maxWidth: '400px',
            flex: '0 1 400px',
            mb: { xs: 0, md: '8px' },
          }}>
            Most fitness apps are built for retention metrics. Kinetic is built for results.
            Every feature exists because athletes need it — nothing more, nothing less.
          </Typography>
        </Box>

        {/* Four pillars */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {PILLARS.map((p, i) => (
            <Grid item xs={12} sm={6} key={p.number}>
              <Box
                sx={{
                  display: 'flex',
                  gap: '24px',
                  p: { xs: '28px', md: '32px' },
                  backgroundColor: KINETIC.surfaceContainer,
                  border: `1px solid ${KINETIC.outline}`,
                  height: '100%',
                  opacity: sectionInView ? 1 : 0,
                  transform: sectionInView ? 'translateY(0)' : 'translateY(32px)',
                  transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
                  '&:hover': {
                    borderColor: 'rgba(255,87,26,0.4)',
                    backgroundColor: '#222424',
                  },
                }}
              >
                {/* Large number */}
                <Typography sx={{
                  fontFamily: "'Anybody', sans-serif",
                  fontSize: { xs: '40px', md: '52px' },
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: 'rgba(255,87,26,0.18)',
                  lineHeight: 1,
                  flexShrink: 0,
                  userSelect: 'none',
                  mt: '-4px',
                }}>
                  {p.number}
                </Typography>

                <Box>
                  <Typography sx={{
                    fontFamily: "'Anybody', sans-serif",
                    fontSize: { xs: '18px', md: '20px' },
                    fontWeight: 800,
                    color: KINETIC.onSurface,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    mb: '10px',
                    lineHeight: 1.2,
                  }}>
                    {p.title}
                  </Typography>
                  <Typography sx={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: KINETIC.onSurfaceVariant,
                  }}>
                    {p.body}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

      </Box>
    </Box>
  );
};

export default WhyKineticSection;