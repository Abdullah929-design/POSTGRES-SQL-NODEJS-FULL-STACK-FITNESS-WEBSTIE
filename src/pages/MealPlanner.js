import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Grid,
  IconButton,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
  CameraAlt as CameraIcon,
  ChevronLeft,
  ChevronRight,
  LocalFireDepartment,
  FitnessCenter as FitnessCenterIcon,
  BakeryDining,
  Opacity,
  TipsAndUpdates
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, addDays, isToday } from 'date-fns';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MealScanner from '../components/MealScanner';

Chart.register(...registerables);

// Kinetic theme tokens
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


const getMealImage = (type) => {
  switch (type) {
    case 'breakfast':
      return 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=300&q=80';
    case 'lunch':
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
    case 'dinner':
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80';
    default:
      return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80';
  }
};

const MealTracker = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [meals, setMeals] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openGoalsDialog, setOpenGoalsDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState(null);
  const [userGoals, setUserGoals] = useState({
    daily_calories: 2500,
    daily_carbs: 250,
    daily_protein: 180,
    daily_fat: 70
  });

  const [mealForm, setMealForm] = useState({
    food_id: '',
    custom_name: '',
    servings: 1,
    meal_type: 'breakfast'
  });

  // Local hydration state
  const [waterIntake, setWaterIntake] = useState(0);

  // Sync hydration state with local storage based on user and date
  useEffect(() => {
    if (userId) {
      const dateKey = format(selectedDate, 'yyyyMMdd');
      const saved = localStorage.getItem(`water_${userId}_${dateKey}`);
      setWaterIntake(saved ? parseFloat(saved) : 0);
    }
  }, [selectedDate, userId]);

  const addWater = (amount) => {
    if (userId) {
      const dateKey = format(selectedDate, 'yyyyMMdd');
      const newVal = parseFloat((waterIntake + amount).toFixed(1));
      setWaterIntake(newVal);
      localStorage.setItem(`water_${userId}_${dateKey}`, newVal);
    }
  };

  const fetchDailyReport = useCallback(async (date) => {
    try {
      const response = await api.get(`/reports/daily`, {
        params: { date }
      });
      setDailyReport(response.data);
    } catch (error) {
      console.error('Error fetching daily report:', error);
    }
  }, []);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await api.get(`/meals`, {
        params: { date: dateStr }
      });
      setMeals(response.data);
      fetchDailyReport(dateStr);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, fetchDailyReport]);

  const fetchUserGoals = useCallback(async () => {
    try {
      const response = await api.get(`/goals`);
      if (response.data) {
        setUserGoals(response.data);
      }
    } catch (error) {
      console.error('Error fetching user goals:', error);
    }
  }, []);

  const fetchFoodItems = useCallback(async () => {
    try {
      const response = await api.get(`/foods`, {
        params: { search: searchQuery }
      });
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (userId) {
      fetchMeals();
      fetchUserGoals();
    }
  }, [userId, selectedDate, fetchMeals, fetchUserGoals]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchFoodItems();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchFoodItems]);

  const handleAddMeal = () => {
    setOpenGoalsDialog(false);
    setOpenReportDialog(false);
    setCurrentMeal(null);
    setMealForm({
      food_id: '',
      custom_name: '',
      servings: 1,
      meal_type: 'breakfast'
    });
    setSearchQuery('');
    setFoodItems([]);
    setOpenDialog(true);
  };

  const handleEditMeal = (meal) => {
    setCurrentMeal(meal);
    setMealForm({
      food_id: meal.food_id || '',
      custom_name: meal.custom_name || '',
      servings: meal.servings || 1,
      meal_type: meal.meal_type || 'breakfast'
    });
    setOpenDialog(true);
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.delete(`/meals/${id}`);
      fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleSaveMeal = async () => {
    try {
      const payload = {
        ...mealForm,
        date: format(selectedDate, 'yyyy-MM-dd')
      };

      if (currentMeal) {
        await api.put(`/meals/${currentMeal.id}`, payload);
      } else {
        await api.post(`/meals`, payload);
      }

      fetchMeals();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleSaveGoals = async () => {
    try {
      await api.post(`/goals`, {
        ...userGoals
      });
      setOpenGoalsDialog(false);
      fetchDailyReport(format(selectedDate, 'yyyy-MM-dd'));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const handleDateChange = (date) => {
    if (date) setSelectedDate(date);
  };

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleFoodSelect = (food) => {
    setMealForm({
      ...mealForm,
      food_id: food.id,
      custom_name: food.name
    });
  };

  const getMealTypeName = (type) => {
    switch (type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      case 'snack': return 'Snack';
      default: return type;
    }
  };

  const getMacroChartData = () => {
    if (!dailyReport?.totals) return null;
    const { total_carbs, total_protein, total_fat } = dailyReport.totals;
    return {
      labels: ['Carbs', 'Protein', 'Fat'],
      datasets: [
        {
          data: [total_carbs, total_protein, total_fat],
          backgroundColor: [KINETIC.primary, KINETIC.secondaryContainer, KINETIC.warning],
          hoverBackgroundColor: [KINETIC.primary, KINETIC.secondaryContainer, KINETIC.warning]
        }
      ]
    };
  };

  const getCalorieChartData = () => {
    if (!dailyReport?.breakdown) return null;
    return {
      labels: dailyReport.breakdown.map(meal => getMealTypeName(meal.meal_type)),
      datasets: [
        {
          label: 'Calories',
          data: dailyReport.breakdown.map(meal => meal.calories),
          backgroundColor: [KINETIC.primaryContainer, KINETIC.secondaryContainer, KINETIC.warning, KINETIC.primary]
        }
      ]
    };
  };

  const getProgress = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        background: '#121414',
        minHeight: '100vh',
        py: { xs: '60px', md: '100px' },
        px: { xs: '24px', md: '64px' },
        width: '100%'
      }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
          
          {/* Header Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'flex-end' },
            gap: 4,
            mb: '4rem'
          }}>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Anybody', sans-serif",
                  fontSize: { xs: '36px', md: '56px' },
                  fontWeight: 800,
                  fontStyle: 'italic',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  mb: 3,
                  color: '#e2e2e2',
                }}
              >
                Kinetic <span style={{ color: '#ff571a' }}>Meal Tracker</span>
              </Typography>
              
              {/* Date chevrons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={handlePrevDay}
                  sx={{
                    color: 'rgba(226, 226, 226, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 0,
                    p: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <Box
                      onClick={params.inputProps.onClick}
                      ref={params.ref}
                      sx={{
                        px: 4,
                        py: 1.5,
                        border: '1px solid rgba(255, 87, 26, 0.3)',
                        backgroundColor: 'rgba(30, 32, 32, 0.7)',
                        backdropFilter: 'blur(20px)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#ff571a'
                        }
                      }}
                    >
                      <Typography sx={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#e2e2e2'
                      }}>
                        {format(selectedDate, 'MMMM d, yyyy')}
                      </Typography>
                      <input {...params.inputProps} style={{ display: 'none' }} />
                    </Box>
                  )}
                />

                <IconButton
                  onClick={handleNextDay}
                  disabled={isToday(selectedDate)}
                  sx={{
                    color: 'rgba(226, 226, 226, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 0,
                    p: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '&:disabled': {
                      color: 'rgba(226, 226, 226, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            </Box>

            {/* Actions list */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
              <Button
                variant="outlined"
                startIcon={<BarChartIcon />}
                onClick={() => {
                  setOpenDialog(false);
                  setOpenGoalsDialog(false);
                  setOpenReportDialog(true);
                }}
                sx={{
                  color: '#e2e2e2',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 0,
                  px: 3,
                  py: 1.5,
                  flex: { xs: '1 1 auto', sm: 'none' },
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: '#ff571a'
                  }
                }}
              >
                View Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<FitnessCenterIcon />}
                onClick={() => {
                  setOpenDialog(false);
                  setOpenReportDialog(false);
                  setOpenGoalsDialog(true);
                }}
                sx={{
                  color: '#e2e2e2',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 0,
                  px: 3,
                  py: 1.5,
                  flex: { xs: '1 1 auto', sm: 'none' },
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: '#ff571a'
                  }
                }}
              >
                Goals
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddMeal}
                sx={{
                  background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                  borderRadius: 0,
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  flex: { xs: '1 1 auto', sm: 'none' },
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 20px rgba(255, 87, 26, 0.15)',
                  '&:hover': {
                    filter: 'brightness(1.1)',
                    boxShadow: '0 0 25px rgba(255, 87, 26, 0.3)',
                  }
                }}
              >
                Add Meal
              </Button>
              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={() => setOpenScanner(true)}
                sx={{
                  background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                  borderRadius: 0,
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  flex: { xs: '1 1 auto', sm: 'none' },
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 20px rgba(255, 87, 26, 0.15)',
                  '&:hover': {
                    filter: 'brightness(1.1)',
                    boxShadow: '0 0 25px rgba(255, 87, 26, 0.3)',
                  }
                }}
              >
                Scan Meal
              </Button>
            </Box>
          </Box>

          {/* Macro Dashboard Cards Grid */}
          <Grid container spacing={3} sx={{ mb: '4rem' }}>
            {/* Calories */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                p: 4,
                backgroundColor: 'rgba(30, 32, 32, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <LocalFireDepartment sx={{ color: '#ff571a', fontSize: '32px' }} />
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.05em' }}>
                    DAILY GOAL: {userGoals.daily_calories || 2500}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '40px', fontWeight: 700, color: '#e2e2e2', lineHeight: 1 }}>
                    {dailyReport?.totals?.total_calories || 0}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)' }}>
                    KCAL
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', h: '8px', backgroundColor: '#333535', borderRadius: 0, overflow: 'hidden', mb: 2 }}>
                  <Box sx={{
                    height: '8px',
                    background: 'linear-gradient(45deg, #ae3200 0%, #ff571a 100%)',
                    width: `${getProgress(dailyReport?.totals?.total_calories || 0, userGoals.daily_calories)}%`
                  }} />
                </Box>
                <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: '#ff571a', letterSpacing: '0.05em' }}>
                  {getProgress(dailyReport?.totals?.total_calories || 0, userGoals.daily_calories)}% REACHED
                </Typography>
              </Box>
            </Grid>
            
            {/* Protein */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                p: 4,
                backgroundColor: 'rgba(30, 32, 32, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <FitnessCenterIcon sx={{ color: '#e2e2e2', fontSize: '32px' }} />
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.05em' }}>
                    GOAL: {userGoals.daily_protein || 180}G
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '40px', fontWeight: 700, color: '#e2e2e2', lineHeight: 1 }}>
                    {dailyReport?.totals?.total_protein || 0}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)' }}>
                    G
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', h: '8px', backgroundColor: '#333535', borderRadius: 0, overflow: 'hidden', mb: 2 }}>
                  <Box sx={{
                    height: '8px',
                    backgroundColor: 'rgba(226, 226, 226, 0.4)',
                    width: `${getProgress(dailyReport?.totals?.total_protein || 0, userGoals.daily_protein)}%`
                  }} />
                </Box>
                <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', letterSpacing: '0.05em' }}>
                  PROTEIN
                </Typography>
              </Box>
            </Grid>

            {/* Carbs */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                p: 4,
                backgroundColor: 'rgba(30, 32, 32, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <BakeryDining sx={{ color: '#e2e2e2', fontSize: '32px' }} />
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.05em' }}>
                    GOAL: {userGoals.daily_carbs || 250}G
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '40px', fontWeight: 700, color: '#e2e2e2', lineHeight: 1 }}>
                    {dailyReport?.totals?.total_carbs || 0}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)' }}>
                    G
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', h: '8px', backgroundColor: '#333535', borderRadius: 0, overflow: 'hidden', mb: 2 }}>
                  <Box sx={{
                    height: '8px',
                    backgroundColor: 'rgba(226, 226, 226, 0.4)',
                    width: `${getProgress(dailyReport?.totals?.total_carbs || 0, userGoals.daily_carbs)}%`
                  }} />
                </Box>
                <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', letterSpacing: '0.05em' }}>
                  CARBS
                </Typography>
              </Box>
            </Grid>

            {/* Fats */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                p: 4,
                backgroundColor: 'rgba(30, 32, 32, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Opacity sx={{ color: '#e2e2e2', fontSize: '32px' }} />
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.05em' }}>
                    GOAL: {userGoals.daily_fat || 70}G
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '40px', fontWeight: 700, color: '#e2e2e2', lineHeight: 1 }}>
                    {dailyReport?.totals?.total_fat || 0}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.4)' }}>
                    G
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', h: '8px', backgroundColor: '#333535', borderRadius: 0, overflow: 'hidden', mb: 2 }}>
                  <Box sx={{
                    height: '8px',
                    backgroundColor: 'rgba(226, 226, 226, 0.4)',
                    width: `${getProgress(dailyReport?.totals?.total_fat || 0, userGoals.daily_fat)}%`
                  }} />
                </Box>
                <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', letterSpacing: '0.05em' }}>
                  FATS
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Main Layout Bento Grid */}
          <Grid container spacing={4} items="start">
            
            {/* Logged Intake Timeline */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{ width: '32px', height: '2px', backgroundColor: '#ff571a' }} />
                <Typography sx={{
                  fontFamily: "'Anybody', sans-serif",
                  fontSize: '24px',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  textTransform: 'uppercase',
                  color: '#e2e2e2'
                }}>
                  Logged Intake
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#ff571a' }} />
                </Box>
              ) : meals.length === 0 ? (
                <Box sx={{
                  p: 6,
                  textAlign: 'center',
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  backgroundColor: 'rgba(30, 32, 32, 0.7)',
                  backdropFilter: 'blur(20px)',
                  mb: 4
                }}>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, mb: 3, color: 'rgba(226, 226, 226, 0.6)' }}>
                    No meals logged for this day yet.
                  </Typography>
                </Box>
              ) : (
                meals.map((meal) => (
                  <Box key={meal.id} sx={{
                    mb: 3,
                    backgroundColor: 'rgba(30, 32, 32, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    overflow: 'hidden',
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: 'rgba(255, 87, 26, 0.3)' }
                  }}>
                    {/* Food Image */}
                    <Box sx={{
                      width: { xs: '100%', md: '180px' },
                      height: '180px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={getMealImage(meal.meal_type)}
                        alt={meal.food_name || meal.custom_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box sx={{
                        display: { xs: 'block', md: 'none' },
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, #121414, transparent)'
                      }} />
                    </Box>
                    
                    {/* Details content */}
                    <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: '#ff571a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            {getMealTypeName(meal.meal_type)} · Serving size: {meal.servings}
                          </Typography>
                          <Typography sx={{ fontFamily: "'Anybody', sans-serif", fontSize: { xs: '20px', md: '24px' }, fontWeight: 800, textTransform: 'capitalize', color: '#e2e2e2', mt: 0.5 }}>
                            {meal.food_name || meal.custom_name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton onClick={() => handleEditMeal(meal)} sx={{ color: 'rgba(226, 226, 226, 0.4)', '&:hover': { color: '#ff571a' } }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteMeal(meal.id)} sx={{ color: 'rgba(226, 226, 226, 0.4)', '&:hover': { color: '#ffb4ab' } }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box sx={{ px: 2, py: 0.5, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.03)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.8)' }}>
                          {meal.calories || 0} KCAL
                        </Box>
                        <Box sx={{ px: 2, py: 0.5, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.03)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.8)' }}>
                          {meal.protein || 0}G PROTEIN
                        </Box>
                        <Box sx={{ px: 2, py: 0.5, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.03)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.8)' }}>
                          {meal.carbs || 0}G CARBS
                        </Box>
                        <Box sx={{ px: 2, py: 0.5, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.03)', fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.8)' }}>
                          {meal.fat || 0}G FAT
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}

              {/* Upcoming Placeholder Meals */}
              {['breakfast', 'lunch', 'dinner'].map((type) => {
                const hasMeal = meals.some((m) => m.meal_type === type);
                if (hasMeal) return null;
                return (
                  <Box
                    key={type}
                    onClick={() => {
                      setMealForm({
                        food_id: '',
                        custom_name: '',
                        servings: 1,
                        meal_type: type
                      });
                      setOpenDialog(true);
                    }}
                    sx={{
                      border: '2px dashed rgba(255, 255, 255, 0.1)',
                      borderRadius: 0,
                      p: 6,
                      mb: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#ff571a',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                      }
                    }}
                  >
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <RestaurantIcon sx={{ color: 'rgba(226, 226, 226, 0.4)' }} />
                    </Box>
                    <Typography sx={{ fontFamily: "'Anybody', sans-serif", fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', color: '#e2e2e2', mb: 1 }}>
                      Upcoming: {type}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '13px', color: 'rgba(226, 226, 226, 0.4)', mb: 3 }}>
                      You haven't logged your {type} yet.
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#e2e2e2',
                        borderRadius: 0,
                        px: 4,
                        py: 1,
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        '&:hover': {
                          backgroundColor: '#ffffff',
                          color: '#121414',
                          borderColor: '#ffffff'
                        }
                      }}
                    >
                      Log {type}
                    </Button>
                  </Box>
                );
              })}
            </Grid>

            {/* Sidebar Columns */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={4}>
                
                {/* Search / Quick Add */}
                <Box sx={{
                  p: 4,
                  backgroundColor: 'rgba(30, 32, 32, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ff571a', textTransform: 'uppercase', letterSpacing: '0.15em', mb: 3 }}>
                    Quick Add
                  </Typography>
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Search foods or brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '48px',
                          backgroundColor: '#0c0f0f',
                          color: '#e2e2e2',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 0 },
                          '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#ff571a' }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'rgba(226, 226, 226, 0.4)' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Whey Isolate', 'Banana', 'Almonds', 'Oat Milk'].map((item) => (
                      <Button
                        key={item}
                        onClick={() => setSearchQuery(item)}
                        sx={{
                          px: 2,
                          py: 1,
                          fontSize: '10px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          color: 'rgba(226,226,226,0.6)',
                          borderRadius: 0,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            color: '#ffffff'
                          }
                        }}
                      >
                        {item}
                      </Button>
                    ))}
                  </Box>
                  
                  {/* Result popup inside Sidebar */}
                  {searchQuery.length > 2 && foodItems.length > 0 && (
                    <Box sx={{ mt: 3, maxHeight: 200, overflow: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
                      {foodItems.map((food) => (
                        <Box
                          key={food.id}
                          onClick={() => {
                            setMealForm({
                              food_id: food.id,
                              custom_name: food.name,
                              servings: 1,
                              meal_type: 'breakfast'
                            });
                            setOpenDialog(true);
                          }}
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                          }}
                        >
                          <Typography variant="body2" sx={{ color: '#e2e2e2', fontWeight: 600 }}>{food.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#ff571a', fontWeight: 700 }}>{food.calories} KCAL</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Hydration Tracker Panel */}
                <Box sx={{
                  p: 4,
                  backgroundColor: 'rgba(30, 32, 32, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderLeft: '4px solid #ff571a',
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#e2e2e2', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      Hydration
                    </Typography>
                    <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: '#e2e2e2' }}>
                      {waterIntake} <span style={{ fontSize: '12px', color: 'rgba(226, 226, 226, 0.4)', fontWeight: 400 }}>/ 3.5L</span>
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1} sx={{ mb: 3 }}>
                    {Array.from({ length: 8 }).map((_, index) => {
                      const active = waterIntake >= (index + 1) * 0.4375;
                      return (
                        <Grid item xs={1.5} key={index}>
                          <Box sx={{
                            height: '48px',
                            background: active ? 'linear-gradient(45deg, #ae3200 0%, #ff571a 100%)' : '#333535',
                            borderRadius: 0
                          }} />
                        </Grid>
                      );
                    })}
                  </Grid>
                  
                  <Button
                    fullWidth
                    onClick={() => addWater(0.25)}
                    sx={{
                      py: 1.5,
                      backgroundColor: '#e2e2e2',
                      color: '#121414',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    + Add 250ml
                  </Button>
                </Box>

                {/* Meal Prep Tip Card */}
                <Box sx={{
                  p: 4,
                  backgroundColor: '#1e2020',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <TipsAndUpdates sx={{ color: '#ff571a', mb: 2, fontSize: '32px' }} />
                    <Typography sx={{ fontFamily: "'Anybody', sans-serif", fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: '#e2e2e2', mb: 1 }}>
                      Meal Prep Tip
                    </Typography>
                    <Typography sx={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px', lineHeight: 1.6, color: 'rgba(226, 226, 226, 0.6)' }}>
                      Prepare your protein sources on Sunday to save 20 minutes per day. Kinetic members who prep lose 15% more fat on average.
                    </Typography>
                  </Box>
                  <Typography sx={{
                    position: 'absolute',
                    bottom: '-32px',
                    right: '-16px',
                    fontSize: '120px',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: 'rgba(255, 255, 255, 0.02)',
                    userSelect: 'none'
                  }}>
                    TIP
                  </Typography>
                </Box>

              </Stack>
            </Grid>

          </Grid>
        </Box>

        {/* Add/Edit Meal Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 0,
              backgroundColor: '#121414',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 30px rgba(255, 87, 26, 0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#1e2020',
            color: '#e2e2e2',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RestaurantIcon sx={{ mr: 1.5, color: '#ff571a' }} />
              <Typography sx={{
                fontFamily: "'Anybody', sans-serif",
                fontSize: '20px',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                color: '#e2e2e2'
              }}>
                {currentMeal ? 'Edit Meal Entry' : 'Add New Meal'}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setOpenDialog(false)}
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
          
          <DialogContent sx={{ backgroundColor: '#121414', p: 3, border: 'none' }}>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', textTransform: 'uppercase', mb: 1 }}>
                Meal Type
              </Typography>
              <Select
                fullWidth
                value={mealForm.meal_type}
                onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value })}
                sx={{
                  borderRadius: 0,
                  backgroundColor: '#0c0f0f',
                  color: '#e2e2e2',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff571a' }
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
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
                <MenuItem value="snack">Snack</MenuItem>
              </Select>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', textTransform: 'uppercase', mb: 1 }}>
                Search Food Database
              </Typography>
              <TextField
                fullWidth
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '48px',
                    backgroundColor: '#0c0f0f',
                    color: '#e2e2e2',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 0 },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff571a' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#ff571a' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {searchQuery.length > 2 && foodItems.length > 0 && (
              <Box sx={{ mb: 3, maxHeight: 180, overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)', p: 1 }}>
                {foodItems.map((food) => (
                  <Box
                    key={food.id}
                    onClick={() => handleFoodSelect(food)}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: mealForm.food_id === food.id ? 'rgba(255, 87, 26, 0.15)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#e2e2e2' }}>{food.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#ff571a', fontWeight: 700 }}>{food.calories} KCAL</Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', textTransform: 'uppercase', mb: 1 }}>
                Or enter custom food
              </Typography>
              <TextField
                fullWidth
                label="Food Name"
                value={mealForm.custom_name}
                onChange={(e) => setMealForm({ ...mealForm, custom_name: e.target.value, food_id: '' })}
                sx={{
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
            </Box>

            <Box sx={{ mb: 1 }}>
              <TextField
                fullWidth
                label="Servings"
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                value={mealForm.servings}
                onChange={(e) => setMealForm({ ...mealForm, servings: parseFloat(e.target.value) || 1 })}
                sx={{
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
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ backgroundColor: '#1e2020', borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{
                color: 'rgba(226, 226, 226, 0.6)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': { color: '#ffffff' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveMeal}
              sx={{
                background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                borderRadius: 0,
                color: 'white',
                px: 3,
                py: 1,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': { filter: 'brightness(1.1)' }
              }}
            >
              {currentMeal ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Nutrition Goals Dialog */}
        <Dialog 
          open={openGoalsDialog} 
          onClose={() => setOpenGoalsDialog(false)} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 0,
              backgroundColor: '#121414',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 30px rgba(255, 87, 26, 0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#1e2020',
            color: '#e2e2e2',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FitnessCenterIcon sx={{ mr: 1.5, color: '#ff571a' }} />
              <Typography sx={{
                fontFamily: "'Anybody', sans-serif",
                fontSize: '20px',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                color: '#e2e2e2'
              }}>
                Nutrition Goals
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setOpenGoalsDialog(false)}
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
          
          <DialogContent sx={{ backgroundColor: '#121414', p: 3, border: 'none' }}>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(226, 226, 226, 0.6)', textTransform: 'uppercase', mb: 1 }}>
                Daily Caloric Target
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={userGoals.daily_calories || ''}
                onChange={(e) => setUserGoals({ ...userGoals, daily_calories: parseInt(e.target.value) || 0 })}
                sx={{
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
            </Box>

            <Typography sx={{ fontFamily: "'Anybody', sans-serif", fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', color: '#e2e2e2', mb: 2 }}>
              Macronutrient Targets
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Protein (g)"
                  type="number"
                  value={userGoals.daily_protein || ''}
                  onChange={(e) => setUserGoals({ ...userGoals, daily_protein: parseInt(e.target.value) || 0 })}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Carbs (g)"
                  type="number"
                  value={userGoals.daily_carbs || ''}
                  onChange={(e) => setUserGoals({ ...userGoals, daily_carbs: parseInt(e.target.value) || 0 })}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Fat (g)"
                  type="number"
                  value={userGoals.daily_fat || ''}
                  onChange={(e) => setUserGoals({ ...userGoals, daily_fat: parseInt(e.target.value) || 0 })}
                  sx={{
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
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ backgroundColor: '#1e2020', borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
            <Button 
              onClick={() => setOpenGoalsDialog(false)}
              sx={{
                color: 'rgba(226, 226, 226, 0.6)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': { color: '#ffffff' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveGoals}
              sx={{
                background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
                borderRadius: 0,
                color: 'white',
                px: 3,
                py: 1,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': { filter: 'brightness(1.1)' }
              }}
            >
              Save Goals
            </Button>
          </DialogActions>
        </Dialog>

        {/* Nutrition Report Dialog */}
        <Dialog
          open={openReportDialog}
          onClose={() => setOpenReportDialog(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 0,
              backgroundColor: '#121414',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 30px rgba(255, 87, 26, 0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#1e2020',
            color: '#e2e2e2',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1.5, color: '#ff571a' }} />
              <Typography sx={{
                fontFamily: "'Anybody', sans-serif",
                fontSize: '20px',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                color: '#e2e2e2'
              }}>
                Nutrition Report: {format(selectedDate, 'MMMM d, yyyy')}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setOpenReportDialog(false)}
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
          
          <DialogContent sx={{ backgroundColor: '#121414', p: 3, border: 'none' }}>
            {dailyReport && (
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ff571a', textTransform: 'uppercase', mb: 2 }}>
                      Macronutrient Distribution
                    </Typography>
                    <Box sx={{ height: 260 }}>
                      {getMacroChartData() && (
                        <Doughnut
                          data={getMacroChartData()}
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              tooltip: {
                                callbacks: {
                                  label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return ` ${label}: ${value}g (${percentage}%)`;
                                  }
                                }
                              },
                              legend: {
                                labels: { color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }
                              }
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ff571a', textTransform: 'uppercase', mb: 2 }}>
                      Calories by Meal
                    </Typography>
                    <Box sx={{ height: 260 }}>
                      {getCalorieChartData() && (
                        <Bar
                          data={getCalorieChartData()}
                          options={{
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Calories', color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" },
                                ticks: { color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" },
                                grid: { color: 'rgba(255,255,255,0.08)' }
                              },
                              x: {
                                ticks: { color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" },
                                grid: { color: 'rgba(255,255,255,0.08)' }
                              }
                            },
                            plugins: {
                              legend: {
                                labels: { color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }
                              }
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ff571a', textTransform: 'uppercase', mb: 2 }}>
                  Meal Breakdown
                </Typography>
                
                <TableContainer component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', backgroundColor: '#1e2020', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#0c0f0f' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" }}>Meal Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" }}>Calories</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" }}>Carbs</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" }}>Protein</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e2e2e2', fontFamily: "'Space Grotesk', sans-serif" }}>Fat</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ '& td': { color: 'rgba(226, 226, 226, 0.8)', fontFamily: "'Space Grotesk', sans-serif" } }}>
                      {dailyReport.breakdown.map((meal) => (
                        <TableRow key={meal.meal_type} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <TableCell sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                            {getMealTypeName(meal.meal_type)}
                          </TableCell>
                          <TableCell align="right">{meal.calories || 0} KCAL</TableCell>
                          <TableCell align="right">{meal.carbs || 0}G</TableCell>
                          <TableCell align="right">{meal.protein || 0}G</TableCell>
                          <TableCell align="right">{meal.fat || 0}G</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#ff571a !important' }}>Total Intake</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#ff571a !important' }}>{dailyReport.totals.total_calories || 0} KCAL</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{dailyReport.totals.total_carbs || 0}G</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{dailyReport.totals.total_protein || 0}G</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{dailyReport.totals.total_fat || 0}G</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: 'rgba(226, 226, 226, 0.4) !important' }}>Daily Goals</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{userGoals.daily_calories || '-'} KCAL</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{userGoals.daily_carbs || '-'}G</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{userGoals.daily_protein || '-'}G</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{userGoals.daily_fat || '-'}G</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ backgroundColor: '#1e2020', borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
            <Button
              onClick={() => setOpenReportDialog(false)}
              sx={{
                color: 'rgba(226, 226, 226, 0.6)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': { color: '#ffffff' }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Auto Meal Nutrient Scanner Dialog */}
        <MealScanner
          open={openScanner}
          onClose={() => setOpenScanner(false)}
          selectedDate={selectedDate}
          onMealAdded={fetchMeals}
        />

      </Box>
    </LocalizationProvider>
  );
};

export default MealTracker;