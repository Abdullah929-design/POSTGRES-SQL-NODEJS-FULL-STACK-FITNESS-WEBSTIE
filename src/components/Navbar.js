import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Stack, IconButton, Drawer, Box, List, ListItem, Button, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Base links always available (in uppercase matching the broadcast aesthetic)
  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/Bmi', label: 'BMI CALCULATOR' },
  ]

  // Features shown only to authenticated users
  if (isAuthenticated) {
    navLinks.push({ path: '/MealPlanner', label: 'MEAL PLANNER' });
    navLinks.push({ path: '/exercises', label: 'EXERCISE BROWSER' });
  }

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    navigate('/')
  }

  const drawer = (
    <Box sx={{ width: 250, pt: 2, height: '100%', backgroundColor: '#121414', color: '#e2e2e2' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "'Anybody', sans-serif",
            fontSize: '24px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#ffb59e',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
          }}
        >
          KINETIC
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#e2e2e2' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.path} sx={{ px: 2, py: 1.5 }}>
            <Link
              to={link.path}
              onClick={handleDrawerToggle}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? '#ffb59e' : 'rgba(226, 226, 226, 0.6)',
                borderBottom: isActive(link.path) ? '2px solid #ffb59e' : 'none',
                cursor: 'pointer',
                display: 'inline-block',
                padding: '4px 0',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
            >
              {link.label}
            </Link>
          </ListItem>
        ))}

        {isAuthenticated ? (
          <ListItem sx={{ px: 2, py: 2 }}>
            <Button
              fullWidth
              onClick={handleLogout}
              className="kinetic-button-ghost"
              startIcon={<LogoutIcon />}
              sx={{ py: '10px' }}
            >
              Logout
            </Button>
          </ListItem>
        ) : (
          <>
            <ListItem sx={{ px: 2, py: 1 }}>
              <Button
                fullWidth
                onClick={() => { handleDrawerToggle(); navigate('/login'); }}
                sx={{
                  color: '#e2e2e2',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0px',
                  py: '10px'
                }}
              >
                Login
              </Button>
            </ListItem>
            <ListItem sx={{ px: 2, py: 1 }}>
              <Button
                fullWidth
                onClick={() => { handleDrawerToggle(); navigate('/Register'); }}
                className="kinetic-button-gradient"
                sx={{ py: '10px' }}
              >
                Register
              </Button>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: 'transparent',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 0 20px rgba(255, 87, 26, 0.1)',
          py: '20px',
          px: { xs: '20px', md: '40px' },
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontSize: '28px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#ffb59e',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          KINETIC
        </Link>

        {/* Desktop Navigation */}
        <Stack
          direction="row"
          gap="40px"
          alignItems="center"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? '#ffb59e' : 'rgba(226, 226, 226, 0.6)',
                borderBottom: isActive(link.path) ? '2px solid #ffb59e' : 'none',
                cursor: 'pointer',
                display: 'block',
                padding: '4px 0',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                if (!isActive(link.path)) e.target.style.color = '#e2e2e2';
              }}
              onMouseOut={(e) => {
                if (!isActive(link.path)) e.target.style.color = 'rgba(226, 226, 226, 0.6)';
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Authenticated user controls */}
          {isAuthenticated ? (
            <>
              <Typography
                sx={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'rgba(226, 226, 226, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={user?.email}
              >
                {user?.email}
              </Typography>
              <Button
                onClick={handleLogout}
                className="kinetic-button-ghost"
                sx={{
                  py: '8px',
                  px: '16px',
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: 'rgba(226, 226, 226, 0.8)',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  padding: '8px 12px',
                  transition: 'color 0.3s ease',
                }}
                onMouseOver={(e) => e.target.style.color = '#ffb59e'}
                onMouseOut={(e) => e.target.style.color = 'rgba(226, 226, 226, 0.8)'}
              >
                Login
              </Link>
              <Button
                onClick={() => navigate('/Register')}
                className="kinetic-button-gradient"
                sx={{
                  py: '10px',
                  px: '24px',
                }}
              >
                Register
              </Button>
            </>
          )}
        </Stack>

        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { md: 'none' }, color: '#e2e2e2' }}
        >
          <MenuIcon />
        </IconButton>
      </Stack>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, backgroundColor: '#121414' },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar

