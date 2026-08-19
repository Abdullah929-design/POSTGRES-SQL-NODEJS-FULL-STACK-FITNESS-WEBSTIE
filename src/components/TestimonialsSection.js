import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const KINETIC = {
  surface: '#0c0f0f',
  surfaceContainer: '#1e2020',
  surfaceContainerLow: '#121414',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#c8c6c5',
  primary: '#ff571a',
  primarySoft: '#ffb59e',
  primaryHover: '#e64a12',
  outline: 'rgba(255, 255, 255, 0.1)',
};

const TESTIMONIALS = [
  {
    quote: 'Kinetic replaced four different apps I was juggling. The meal tracker alone is worth it — finally a food log that doesn\'t feel like a chore.',
    name: 'Ayesha R.',
    role: 'Competitive Powerlifter',
    stat: '–18 kg in 14 weeks',
  },
  {
    quote: 'The exercise library is the most complete I\'ve found. Filtering by muscle group and equipment makes programming so much faster.',
    name: 'Marcus T.',
    role: 'Personal Trainer',
    stat: '500+ exercises catalogued',
  },
  {
    quote: 'I\'ve tried every tracker out there. Kinetic is the only one that treats me like I know what I\'m doing instead of hand-holding me.',
    name: 'Priya S.',
    role: 'Marathon Runner',
    stat: 'Sub-3:30 PB this season',
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

const TestimonialsSection = () => {
  const [sectionRef, sectionInView] = useInView(0.1);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
      {/* Ambient left glow */}
      <Box sx={{
        position: 'absolute',
        top: '30%',
        left: '-80px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,87,26,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: '24px', md: '64px' }, position: 'relative' }}>

        {/* Header */}
        <Box sx={{ mb: { xs: '56px', md: '80px' } }}>
          <Typography sx={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: KINETIC.primary,
            mb: '12px',
          }}>
            Athlete Voices
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
            RESULTS SPEAK<br />
            <span style={{ color: KINETIC.primarySoft }}>LOUDER THAN</span> ADS
          </Typography>
        </Box>

        {/* Testimonial cards */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: '64px', md: '96px' } }}>
          {TESTIMONIALS.map((t, i) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Box
                sx={{
                  backgroundColor: KINETIC.surfaceContainer,
                  border: `1px solid ${KINETIC.outline}`,
                  p: { xs: '28px', md: '36px' },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '32px',
                  opacity: sectionInView ? 1 : 0,
                  transform: sectionInView ? 'translateY(0)' : 'translateY(28px)',
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: 'rgba(255,87,26,0.35)',
                  },
                }}
              >
                {/* Opening quote mark */}
                <Typography sx={{
                  fontFamily: "'Anybody', sans-serif",
                  fontSize: '80px',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: 'rgba(255,87,26,0.12)',
                  lineHeight: 0.7,
                  userSelect: 'none',
                  mb: '-16px',
                }}>
                  "
                </Typography>

                {/* Quote */}
                <Typography sx={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '16px',
                  lineHeight: '28px',
                  color: KINETIC.onSurface,
                  fontStyle: 'italic',
                  flex: 1,
                }}>
                  {t.quote}
                </Typography>

                {/* Divider */}
                <Box sx={{ height: '1px', backgroundColor: KINETIC.outline }} />

                {/* Attribution + stat */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Box>
                    <Typography sx={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14px',
                      fontWeight: 700,
                      color: KINETIC.onSurface,
                      letterSpacing: '0.05em',
                    }}>
                      {t.name}
                    </Typography>
                    <Typography sx={{
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      fontSize: '12px',
                      color: KINETIC.onSurfaceVariant,
                      mt: '2px',
                    }}>
                      {t.role}
                    </Typography>
                  </Box>
                  <Typography sx={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: KINETIC.primarySoft,
                    textAlign: 'right',
                    maxWidth: '120px',
                    lineHeight: 1.3,
                  }}>
                    {t.stat}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Final CTA banner */}
        <Box
          sx={{
            backgroundColor: KINETIC.surfaceContainer,
            border: `1px solid ${KINETIC.outline}`,
            borderLeft: `4px solid ${KINETIC.primary}`,
            p: { xs: '32px 28px', md: '48px 56px' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: '32px',
            opacity: sectionInView ? 1 : 0,
            transform: sectionInView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s',
          }}
        >
          <Box>
            <Typography sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: { xs: '24px', md: '32px' },
              fontWeight: 900,
              fontStyle: 'italic',
              color: KINETIC.onSurface,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              mb: '8px',
            }}>
              Ready to write your own story?
            </Typography>
            <Typography sx={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '15px',
              color: KINETIC.onSurfaceVariant,
            }}>
              Free to start. No credit card. No subscriptions.
            </Typography>
          </Box>

          <Box
            onClick={() => navigate(isAuthenticated ? '/MealPlanner' : '/Register')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'white',
              background: `linear-gradient(45deg, ${KINETIC.primary} 0%, #ff8a00 90%)`,
              px: '36px',
              py: '16px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(255, 87, 26, 0.35)',
              flexShrink: 0,
              transition: 'all 0.2s ease-out',
              '&:hover': {
                background: `linear-gradient(45deg, ${KINETIC.primaryHover} 0%, #e67c00 90%)`,
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 28px rgba(255, 87, 26, 0.45)',
              },
            }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Join Kinetic — Free'}
            {/* Arrow */}
            <Box component="span" sx={{
              display: 'inline-block',
              fontSize: '18px',
              lineHeight: 1,
              mt: '-1px',
            }}>→</Box>
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default TestimonialsSection;