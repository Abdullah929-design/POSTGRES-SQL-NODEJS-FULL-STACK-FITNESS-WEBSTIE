import React, { useState } from 'react'
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import bannerImage from "../assets/images/banner.png"

// Kinetic theme tokens
const KINETIC = {
  surface: '#121414',
  surfaceContainer: '#1e2020',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#e6beb2',
  primary: '#ffb59e',
  primarySoft: '#ff571a',
  outline: '#ad897e',
};

const Banner = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: '#0c0f0f',
      mt: -5,
      pt: 0,
    }}>

      {/* Background Image Container */}
      <Box sx={{
        position: 'absolute',
        top: '40px', // Shifted down so static image/video is completely visible from the top
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}>
        {/* Static Background Image */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top', // Positioned from top to prevent crop
          transition: 'opacity 1000ms ease',
          opacity: isHovered ? 0.25 : 0.85,
        }}>
          {/* Dark gradients to preserve typography readability */}
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #0c0f0f 0%, rgba(12,15,15,0.4) 100%)',
          }} />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, #0c0f0f 0%, rgba(12,15,15,0) 50%, rgba(12,15,15,0) 100%)',
          }} />
        </Box>

        {/* Background Video */}
        <Box
          component="video"
          autoPlay
          loop
          muted
          playsInline
          src="https://res.cloudinary.com/dv7fu8gwf/video/upload/v1784447160/Initial_Scene_-_2026-07-18_202607182352_sj8rpf.mp4"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'opacity 1000ms ease',
            opacity: isHovered ? 1 : 0,
            zIndex: 10,
          }}
        />
      </Box>

      {/* Content Container */}
      <Box sx={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        maxWidth: '1440px',
        mx: 'auto',
        px: { xs: '24px', md: '64px' },
        py: { xs: '40px', md: '80px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80vh',
        transition: 'opacity 500ms ease-in-out',
        opacity: isHovered ? 0 : 1,
        pointerEvents: isHovered ? 'none' : 'auto',
      }}>
        <Box sx={{ maxWidth: '650px' }}>
          {/* Main Title heading (BREAK YOUR LIMITS in Anybody italic font) */}
          <Typography
            sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: { xs: '48px', sm: '64px', md: '80px' },
              fontWeight: 900,
              fontStyle: 'italic',
              lineHeight: 1.0,
              color: KINETIC.onSurface,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              mb: '24px',
            }}
          >
            BREAK <br />
            <span className="kinetic-text-stroke">YOUR</span> <br />
            LIMITS
          </Typography>

          {/* Subheading in Hanken Grotesk */}
          <Typography
            sx={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              fontWeight: 400,
              color: KINETIC.onSurfaceVariant,
              mb: '40px',
              maxWidth: '480px',
            }}
          >
            The ultimate high-intensity performance platform. Experience cinematic training routines designed by world-class athletes to transform your physiology.
          </Typography>

          
        </Box>
      </Box>

      {/* Hover Trigger and Swipe Prompt Area */}
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '160px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pb: '48px',
          cursor: 'pointer',
          transition: 'transform 0.5s ease',
          '&:hover .swipe-prompt-text': {
            opacity: 1,
            transform: 'translateY(-8px)',
          },
          '&:hover .swipe-prompt-icon': {
            opacity: 0.8,
            transform: 'translateY(-8px)',
          }
        }}
      >
        <Typography
          className="swipe-prompt-text"
          sx={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#ffffff',
            opacity: 0.6,
            transition: 'all 0.5s ease',
          }}
        >
          Hover here to view video tour
        </Typography>
        <Box
          className="swipe-prompt-icon material-symbols-outlined"
          sx={{
            color: '#ffffff',
            opacity: 0.4,
            mt: '8px',
            transition: 'all 0.5s ease',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(6px)' },
            }
          }}
        >
          expand_more
        </Box>
      </Box>
    </Box>
  )
}

export default Banner
