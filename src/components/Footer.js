import React from 'react';
import { Box, Typography, Link, Stack } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import ShareIcon from '@mui/icons-material/Share';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0c0f0f',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        py: { xs: '40px', md: '64px' },
        width: '100%',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        gap="32px"
        sx={{
          maxWidth: '1440px',
          mx: 'auto',
          px: { xs: '24px', md: '64px' },
          width: '100%',
        }}
      >
        {/* Brand & Copyright */}
        <Stack gap="12px" sx={{ alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '32px',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              color: '#e2e2e2',
              letterSpacing: '-0.02em',
            }}
          >
            KINETIC
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(226, 226, 226, 0.4)',
            }}
          >
            © {new Date().getFullYear()} KINETIC PERFORMANCE. ALL RIGHTS RESERVED.
          </Typography>
        </Stack>

        {/* Links */}
        <Stack
          direction="row"
          gap="24px"
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Privacy Policy', 'Terms of Service', 'Contact', 'Careers', 'Support'].map((item) => (
            <Link
              key={item}
              href="#"
              underline="none"
              sx={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(226, 226, 226, 0.4)',
                transition: 'color 0.3s ease',
                '&:hover': {
                  color: '#ffb59e',
                },
              }}
            >
              {item}
            </Link>
          ))}
        </Stack>

        {/* Social Icons */}
        <Stack direction="row" gap="16px">
          {[
            { icon: <PublicIcon sx={{ fontSize: '20px' }} />, label: 'Website' },
            { icon: <ShareIcon sx={{ fontSize: '20px' }} />, label: 'Share' },
          ].map((social, idx) => (
            <Box
              key={idx}
              aria-label={social.label}
              sx={{
                width: '40px',
                height: '40px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(226, 226, 226, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#ffb59e',
                  color: '#ffb59e',
                  boxShadow: '0 0 10px rgba(255, 181, 158, 0.2)',
                },
              }}
            >
              {social.icon}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;