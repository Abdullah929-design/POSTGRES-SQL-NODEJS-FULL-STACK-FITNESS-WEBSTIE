import React from 'react';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Kinetic theme tokens
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

const FEATURES = [
  {
    tag: 'TRACK',
    title: 'Precision Nutrition',
    body: 'Log every meal with macro breakdowns and live progress bars. Hit your daily targets with cinematic clarity.',
    route: '/MealPlanner',
  },
  {
    tag: 'MOVE',
    title: 'Exercise Library',
    body: 'Browse hundreds of movements by muscle, equipment, or body part — each with embedded tutorial videos.',
    route: '/exercises',
  },
  {
    tag: 'KNOW',
    title: 'BMI & Health',
    body: 'Calculate your BMI and get personalized calorie and macro guidance tuned to your physique.',
    route: '/Bmi',
  },
];

const STATS = [
  { value: '500+', label: 'Exercises' },
  { value: '3', label: 'Macro Targets' },
  { value: '100%', label: 'Kinetic' },
];

const FeaturesSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: KINETIC.surface,
        background: `linear-gradient(180deg, ${KINETIC.surface} 0%, ${KINETIC.surfaceContainerLow} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: '64px', md: '96px' },
        pb: { xs: '64px', md: '96px' },
      }}
    >
      {/* Atmospheric orange glow */}
      <Box sx={{
        position: 'absolute',
        top: '-80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 87, 26, 0.15) 0%, rgba(255, 87, 26, 0) 70%)',
        filter: 'blur(30px)',
      }} />

      <Box sx={{ maxWidth: '1440px', mx: 'auto', px: { xs: '24px', md: '64px' }, position: 'relative' }}>
        {/* Eyebrow + heading */}
        <Box sx={{ textAlign: 'center', mb: { xs: '48px', md: '64px' } }}>
          <Typography
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: KINETIC.primary,
              mb: '12px',
            }}
          >
            The Kinetic System
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: { xs: '32px', md: '48px' },
              fontWeight: 900,
              fontStyle: 'italic',
              lineHeight: 1.05,
              color: KINETIC.onSurface,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              mb: '16px',
            }}
          >
            Train Hard. <span style={{ color: KINETIC.primarySoft }}>Eat Smart.</span>
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '16px',
              lineHeight: '26px',
              color: KINETIC.onSurfaceVariant,
              maxWidth: '560px',
              mx: 'auto',
            }}
          >
            One high-performance platform for movement and nutrition. Built for athletes who treat every rep and every meal as part of the same cinematic routine.
          </Typography>
        </Box>

        {/* Feature cards */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: '56px', md: '80px' } }}>
          {FEATURES.map((f) => (
            <Grid item xs={12} md={4} key={f.title}>
              <Box
                onClick={() => navigate(f.route)}
                sx={{
                  height: '100%',
                  backgroundColor: KINETIC.surfaceContainer,
                  border: `1px solid ${KINETIC.outline}`,
                  borderRadius: '4px',
                  p: { xs: '28px', md: '32px' },
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: KINETIC.primary,
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(255, 87, 26, 0.18)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: KINETIC.primary,
                    mb: '16px',
                  }}
                >
                  {f.tag}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Anybody', sans-serif",
                    fontSize: '24px',
                    fontWeight: 800,
                    color: KINETIC.onSurface,
                    mb: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: KINETIC.onSurfaceVariant,
                  }}
                >
                  {f.body}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Stats strip */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: '32px', md: '80px' },
            py: '32px',
            borderTop: `1px solid ${KINETIC.outline}`,
            borderBottom: `1px solid ${KINETIC.outline}`,
          }}
        >
          {STATS.map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: { xs: '36px', md: '48px' },
                  fontWeight: 700,
                  color: KINETIC.primarySoft,
                  lineHeight: 1,
                  mb: '8px',
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: KINETIC.onSurfaceVariant,
                }}
              >
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mt: { xs: '56px', md: '72px' } }}>
          <Typography
            onClick={() => navigate(isAuthenticated ? '/MealPlanner' : '/Register')}
            sx={{
              display: 'inline-block',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'white',
              background: `linear-gradient(45deg, ${KINETIC.primary} 0%, #ff8a00 90%)`,
              px: '40px',
              py: '16px',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(255, 87, 26, 0.35)',
              transition: 'all 0.2s ease-out',
              '&:hover': {
                background: `linear-gradient(45deg, ${KINETIC.primaryHover} 0%, #e67c00 90%)`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            {isAuthenticated ? 'Go to Meal Planner' : 'Start Training Free'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturesSection;
