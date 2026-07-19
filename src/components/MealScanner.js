import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Paper,
  Stack,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as PhotoIcon,
  Restaurant as RestaurantIcon,
  Check as CheckIcon,
  Close as NoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../utils/api';
// Kinetic theme configuration

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

// Convert a File or Blob into a base64 data URL (without the data: prefix).
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // data:image/jpeg;base64,....
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Could not read the selected image'));
    reader.readAsDataURL(file);
  });
}

const MealScanner = ({ open, onClose, selectedDate, onMealAdded }) => {
  const [captureMode, setCaptureMode] = useState(null); // 'file' | 'live' | null
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // parsed Gemini result
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Live camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop the camera when the dialog closes or unmounts.
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const resetState = () => {
    setCaptureMode(null);
    setAnalyzing(false);
    setResult(null);
    setShowAddForm(false);
    setSubmitting(false);
    setSuccess(false);
    setError('');
    stopCamera();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    if (!open) stopCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ---- Analyze via backend ----
  const analyze = async (base64, mimeType) => {
    setAnalyzing(true);
    setError('');
    setResult(null);
    try {
      const response = await api.post('/meals/scan', { image: base64, mimeType });
      setResult(response.data);
    } catch (err) {
      const msg =
        (err.response && err.response.data && err.response.data.error) ||
        'Failed to analyze the image. Please try again.';
      setError(msg);
    } finally {
      setAnalyzing(false);
      setCaptureMode(null);
    }
  };

  // ---- Live camera ----
  const startLiveCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCaptureMode('live');
      // Wait for the video element to attach, then bind the stream.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      if (err && err.name === 'NotAllowedError') {
        setError('Camera permission was denied. Please allow camera access or use the photo upload option.');
      } else if (err && err.name === 'NotFoundError') {
        setError('No camera found on this device. Please use the photo upload option.');
      } else {
        setError('Could not start the camera. Please use the photo upload option.');
      }
      setCaptureMode('file');
    }
  };

  const captureFromLive = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      setError('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }
    // Draw the current video frame to the canvas. Works on laptop + mobile.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64 = dataUrl.split(',')[1];
    stopCamera();
    analyze(base64, 'image/jpeg');
  };

  // ---- File input ----
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError('');
    try {
      const base64 = await fileToBase64(file);
      analyze(base64, file.type || 'image/jpeg');
    } catch (err) {
      setError(err.message || 'Could not read the selected image.');
    }
    // Reset so selecting the same file again re-triggers onChange.
    e.target.value = '';
  };

  // ---- Confirm: add to tracking ----
  const [addForm, setAddForm] = useState({
    meal_type: 'breakfast',
    custom_name: '',
    servings: 1,
  });

  const beginAdd = () => {
    setAddForm({
      meal_type: 'breakfast',
      custom_name: result.foodName || '',
      servings: 1,
    });
    setShowAddForm(true);
  };

  const submitAdd = async () => {
    if (!result) return;
    setSubmitting(true);
    setError('');
    const s = Number(addForm.servings) || 1;
    const payload = {
      custom_name: addForm.custom_name,
      meal_type: addForm.meal_type,
      servings: s,
      date: format(selectedDate, 'yyyy-MM-dd'),
      // Scale the per-serving Gemini estimates by the chosen servings count.
      calories: Math.round((result.calories || 0) * s),
      protein: parseFloat(((result.protein_g || 0) * s).toFixed(1)),
      carbs: parseFloat(((result.carbs_g || 0) * s).toFixed(1)),
      fat: parseFloat(((result.fat_g || 0) * s).toFixed(1)),
    };
    try {
      await api.post('/meals', payload);
      setSuccess(true);
      setShowAddForm(false);
      if (onMealAdded) onMealAdded();
    } catch (err) {
      const msg =
        (err.response && err.response.data && err.response.data.error) ||
        'Failed to save the meal. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const KINETIC = {
    surface: '#121414',
    surfaceContainer: '#1e2020',
    surfaceContainerLowest: '#0c0f0f',
    onSurface: '#e2e2e2',
    onSurfaceVariant: '#e6beb2',
    primary: '#ffb59e',
    primaryContainer: '#ff571a',
    secondaryContainer: '#d10235',
    outline: 'rgba(255, 255, 255, 0.1)',
    error: '#ffb4ab',
    success: '#4caf50',
    warning: '#ffc107',
  };

  const confidenceColor =
    result && result.confidence === 'high'
      ? KINETIC.success
      : result && result.confidence === 'medium'
      ? KINETIC.warning
      : KINETIC.error;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 0, // SHARP corners
          backgroundColor: KINETIC.surface,
          border: `1px solid ${KINETIC.outline}`,
          boxShadow: '0 0 30px rgba(255, 87, 26, 0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: KINETIC.surfaceContainer,
          borderBottom: `1px solid ${KINETIC.outline}`,
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CameraIcon sx={{ mr: 1.5, color: '#ff571a' }} />
          <Typography
            sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '22px',
              fontWeight: 900,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: KINETIC.onSurface,
            }}
          >
            Scan Meal
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'rgba(226, 226, 226, 0.6)',
            '&:hover': { color: '#ffb4ab' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: KINETIC.surface, p: 3, border: 'none' }}>
        {error && (
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 0,
              backgroundColor: 'rgba(209, 2, 53, 0.1)',
              borderLeft: `4px solid #d10235`,
            }}
          >
            <Typography variant="body2" color="#ffb4ab" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
              {error}
            </Typography>
          </Paper>
        )}

        {/* Step 1: choose capture method */}
        {!analyzing && !result && captureMode === null && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body1" sx={{ color: 'rgba(226, 226, 226, 0.8)', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Take or upload a photo of your meal and we'll estimate its nutrition.
            </Typography>
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={startLiveCamera}
              sx={{
                background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                borderRadius: 0,
                color: 'white',
                py: 1.5,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': {
                  filter: 'brightness(1.1)',
                  boxShadow: '0 4px 15px rgba(255, 87, 26, 0.3)',
                }
              }}
            >
              Use Camera (Live)
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoIcon />}
              sx={{
                color: KINETIC.onSurface,
                borderColor: KINETIC.outline,
                borderRadius: 0,
                py: 1.5,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              Upload Photo
              <input
                hidden
                accept="image/*"
                type="file"
                capture="environment"
                onChange={handleFileChange}
              />
            </Button>
          </Stack>
        )}

        {/* Step 2a: live camera preview */}
        {captureMode === 'live' && !analyzing && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(226, 226, 226, 0.6)', fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Position your meal in frame and tap Capture.
            </Typography>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                borderRadius: 0,
                backgroundColor: '#000',
                border: `1px solid ${KINETIC.outline}`
              }}
            />
            {/* Hidden canvas used to snapshot the video frame. */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={captureFromLive}
                sx={{
                  background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                  borderRadius: 0,
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  '&:hover': { filter: 'brightness(1.1)' }
                }}
              >
                Capture
              </Button>
              <Button
                variant="text"
                onClick={() => { stopCamera(); setCaptureMode(null); }}
                sx={{
                  color: 'rgba(226, 226, 226, 0.6)',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  '&:hover': { color: '#ffffff' }
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        )}

        {/* Step 2b: analyzing */}
        {analyzing && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#ff571a' }} />
            <Typography sx={{ mt: 2, color: '#ffb59e', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em' }}>
              ANALYZING YOUR MEAL…
            </Typography>
          </Box>
        )}

        {/* Step 3: result card */}
        {result && !success && (
          <Box sx={{ mt: 1 }}>
            <Paper sx={{
              p: 3,
              borderRadius: 0,
              backgroundColor: KINETIC.surfaceContainer,
              border: `1px solid ${KINETIC.outline}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RestaurantIcon sx={{ color: '#ff571a', mr: 1.5 }} />
                  <Typography sx={{
                    fontFamily: "'Anybody', sans-serif",
                    fontSize: '18px',
                    fontWeight: 800,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    color: KINETIC.onSurface
                  }}>
                    {result.foodName}
                  </Typography>
                </Box>
                <Chip
                  label={`CONFIDENCE: ${(result.confidence || 'low').toUpperCase()}`}
                  size="small"
                  sx={{
                    borderRadius: 0,
                    backgroundColor: confidenceColor,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '10px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '0.05em'
                  }}
                />
              </Box>

              {result.servingSizeEstimate && (
                <Typography sx={{
                  color: 'rgba(226, 226, 226, 0.6)',
                  fontSize: '13px',
                  mb: 2,
                  fontFamily: "'Hanken Grotesk', sans-serif"
                }}>
                  Serving: {result.servingSizeEstimate}
                </Typography>
              )}

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(226, 226, 226, 0.4)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                    CALORIES
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: '#ff571a', mt: 0.5 }}>
                    {result.calories || 0} <span style={{ fontSize: '11px', color: 'rgba(226, 226, 226, 0.4)' }}>KCAL</span>
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(226, 226, 226, 0.4)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                    PROTEIN
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: '#ffb59e', mt: 0.5 }}>
                    {result.protein_g || 0}<span style={{ fontSize: '11px', color: 'rgba(226, 226, 226, 0.4)' }}>G</span>
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(226, 226, 226, 0.4)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                    CARBS
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: '#ffb59e', mt: 0.5 }}>
                    {result.carbs_g || 0}<span style={{ fontSize: '11px', color: 'rgba(226, 226, 226, 0.4)' }}>G</span>
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'rgba(226, 226, 226, 0.4)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
                    FAT
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: '#ff571a', mt: 0.5 }}>
                    {result.fat_g || 0}<span style={{ fontSize: '11px', color: 'rgba(226, 226, 226, 0.4)' }}>G</span>
                  </Typography>
                </Grid>
              </Grid>

              {result.notes && (
                <Typography sx={{
                  display: 'block',
                  mt: 2,
                  color: 'rgba(226, 226, 226, 0.5)',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  fontFamily: "'Hanken Grotesk', sans-serif"
                }}>
                  {result.notes}
                </Typography>
              )}
            </Paper>

            {/* Confirmation prompt */}
            {!showAddForm && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ color: KINETIC.onSurface, mb: 2, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.05em' }}>
                  SHOULD THIS MEAL BE ADDED TO YOUR TRACKING?
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={beginAdd}
                    sx={{
                      background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                      borderRadius: 0,
                      color: 'white',
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      '&:hover': { filter: 'brightness(1.1)' }
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<NoIcon />}
                    onClick={() => setResult(null)}
                    sx={{
                      color: '#ffb4ab',
                      borderColor: 'rgba(255, 180, 171, 0.3)',
                      borderRadius: 0,
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      '&:hover': {
                        borderColor: '#ffb4ab',
                        backgroundColor: 'rgba(255, 180, 171, 0.05)'
                      }
                    }}
                  >
                    No
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Add form */}
            {showAddForm && (
              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="scan-meal-type-label" sx={{ color: 'rgba(226, 226, 226, 0.6)', fontFamily: "'Space Grotesk', sans-serif", '&.Mui-focused': { color: '#ff571a' } }}>Meal Type</InputLabel>
                  <Select
                    labelId="scan-meal-type-label"
                    label="Meal Type"
                    value={addForm.meal_type}
                    onChange={(e) => setAddForm({ ...addForm, meal_type: e.target.value })}
                    sx={{
                      borderRadius: 0,
                      backgroundColor: '#0c0f0f',
                      color: '#e2e2e2',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff571a'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#1e2020',
                          color: '#e2e2e2',
                          borderRadius: 0,
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }
                      }
                    }}
                  >
                    {MEAL_TYPES.map((m) => (
                      <MenuItem key={m.value} value={m.value} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }, '&.Mui-selected': { backgroundColor: 'rgba(255, 87, 26, 0.2)' } }}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Food Name"
                  value={addForm.custom_name}
                  onChange={(e) => setAddForm({ ...addForm, custom_name: e.target.value })}
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': { color: 'rgba(226, 226, 226, 0.6)', fontFamily: "'Space Grotesk', sans-serif", '&.Mui-focused': { color: '#ff571a' } },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: '#0c0f0f',
                      color: '#e2e2e2',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#ff571a' }
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Servings"
                  type="number"
                  inputProps={{ min: 0.1, step: 0.1 }}
                  value={addForm.servings}
                  onChange={(e) => setAddForm({ ...addForm, servings: parseFloat(e.target.value) || 1 })}
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': { color: 'rgba(226, 226, 226, 0.6)', fontFamily: "'Space Grotesk', sans-serif", '&.Mui-focused': { color: '#ff571a' } },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: '#0c0f0f',
                      color: '#e2e2e2',
                      fontFamily: "'Hanken Grotesk', sans-serif",
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&.Mui-focused fieldset': { borderColor: '#ff571a' }
                    }
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={submitAdd}
                    disabled={submitting}
                    sx={{
                      background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                      borderRadius: 0,
                      color: 'white',
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      '&:hover': { filter: 'brightness(1.1)' }
                    }}
                  >
                    {submitting ? 'Saving…' : 'Add Meal'}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                    sx={{
                      color: 'rgba(226, 226, 226, 0.6)',
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      '&:hover': { color: '#ffffff' }
                    }}
                  >
                    Back
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Step 4: success */}
        {success && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckIcon sx={{ fontSize: 60, color: KINETIC.success, mb: 2 }} />
            <Typography sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: '20px',
              fontWeight: 800,
              fontStyle: 'italic',
              textTransform: 'uppercase',
              color: KINETIC.onSurface,
              mb: 3
            }}>
              Meal added to your tracking!
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => { setResult(null); setSuccess(false); }}
                sx={{
                  color: KINETIC.onSurface,
                  borderColor: KINETIC.outline,
                  borderRadius: 0,
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                Scan Another
              </Button>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                  borderRadius: 0,
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  '&:hover': { filter: 'brightness(1.1)' }
                }}
              >
                Done
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: KINETIC.surfaceContainer, borderTop: `1px solid ${KINETIC.outline}`, p: 2 }}>
        {result && !success && (
          <Button
            onClick={handleClose}
            sx={{
              color: 'rgba(226, 226, 226, 0.6)',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              '&:hover': { color: '#ffffff' }
            }}
          >
            Close
          </Button>
        )}
        {!result && !analyzing && (
          <Button
            onClick={handleClose}
            sx={{
              color: 'rgba(226, 226, 226, 0.6)',
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              '&:hover': { color: '#ffffff' }
            }}
          >
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MealScanner;
