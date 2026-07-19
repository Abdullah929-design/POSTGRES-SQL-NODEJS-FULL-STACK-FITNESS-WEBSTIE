import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Kinetic theme tokens (aligned with Banner/Navbar/ExerciseBrowser)
const KINETIC = {
  surface: '#0c0f0f',
  surfaceContainer: '#1e2020',
  surfaceContainerLow: '#121414',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#c8c6c5',
  primary: '#ff571a',
  primarySoft: '#ffb59e',
  primaryHover: '#e64a12',
  primaryFilled: 'rgba(255, 87, 26, 0.12)',
  outline: 'rgba(255, 255, 255, 0.1)',
  error: '#ff8a80',
};

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: `1px solid ${hasError ? KINETIC.error : 'rgba(255, 255, 255, 0.12)'}`,
  borderRadius: '4px',
  color: KINETIC.onSurface,
  fontSize: '16px',
  fontFamily: "'Hanken Grotesk', sans-serif",
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
});

const labelStyle = {
  display: 'block',
  color: KINETIC.onSurfaceVariant,
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '13px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '8px',
};

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';

    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'At least 6 characters';

    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup(email.trim().toLowerCase(), password);
      navigate('/MealPlanner');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Unable to create your account right now. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${KINETIC.surface} 0%, ${KINETIC.surfaceContainerLow} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Hanken Grotesk', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Atmospheric kinetic glows */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(255, 87, 26, 0.18) 0%, rgba(255, 87, 26, 0) 70%)',
        filter: 'blur(20px)', borderRadius: '50%',
      }}></div>
      <div style={{
        position: 'absolute', bottom: '10%', right: '8%', width: '360px', height: '360px',
        background: 'radial-gradient(circle, rgba(255, 181, 158, 0.12) 0%, rgba(255, 181, 158, 0) 70%)',
        filter: 'blur(20px)', borderRadius: '50%',
      }}></div>

      <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          position: 'relative',
          background: 'rgba(30, 32, 32, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '4px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '40px',
          border: `1px solid ${KINETIC.outline}`,
        }}>
          {/* Brand wordmark */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '34px',
              fontWeight: 900,
              fontStyle: 'italic',
              color: KINETIC.primarySoft,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}>
              KINETIC
            </span>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '30px', fontWeight: 900, fontStyle: 'italic',
              color: KINETIC.onSurface, marginBottom: '8px',
              textTransform: 'uppercase', letterSpacing: '-0.02em',
            }}>
              Create Account
            </h1>
            <p style={{ color: KINETIC.onSurfaceVariant, fontSize: '15px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Start tracking your nutrition journey
            </p>
          </div>

          {apiError && (
            <div style={{
              background: 'rgba(255, 138, 128, 0.12)',
              border: `1px solid rgba(255, 138, 128, 0.4)`,
              color: KINETIC.error,
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle(errors.email)}
              />
              {errors.email && <p style={{ color: KINETIC.error, fontSize: '13px', marginTop: '6px', fontFamily: "'Hanken Grotesk', sans-serif" }}>{errors.email}</p>}
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle(errors.password)}
              />
              {errors.password && <p style={{ color: KINETIC.error, fontSize: '13px', marginTop: '6px', fontFamily: "'Hanken Grotesk', sans-serif" }}>{errors.password}</p>}
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={inputStyle(errors.confirm)}
              />
              {errors.confirm && <p style={{ color: KINETIC.error, fontSize: '13px', marginTop: '6px', fontFamily: "'Hanken Grotesk', sans-serif" }}>{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '8px',
                background: `linear-gradient(45deg, ${KINETIC.primary} 0%, #ff8a00 90%)`,
                color: 'white',
                padding: '14px 24px',
                borderRadius: '4px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(255, 87, 26, 0.35)',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s ease-out',
              }}
              onMouseOver={(e) => { if (!submitting) e.target.style.background = `linear-gradient(45deg, ${KINETIC.primaryHover} 0%, #e67c00 90%)`; }}
              onMouseOut={(e) => { if (!submitting) e.target.style.background = `linear-gradient(45deg, ${KINETIC.primary} 0%, #ff8a00 90%)`; }}
            >
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: KINETIC.onSurfaceVariant, marginTop: '24px', fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: KINETIC.primarySoft, fontWeight: 700, textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
