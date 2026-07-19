import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, TextField, Button, CircularProgress, Pagination, PaginationItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const Search = () => {
  // ExerciseDB API configuration
  const API_BASE_URL = "https://exercisedb.p.rapidapi.com";
  const API_HOST = "exercisedb.p.rapidapi.com";
  const API_KEY = "4f1bf5105dmshc01806e19a87df9p12271bjsn6d88532c6a2d";

  // YouTube API configuration
  const YOUTUBE_API_KEY = "AIzaSyAwSxuo0maJvPrZlthYSZNatqRkBzm-8ds";

  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBodyPart, setActiveBodyPart] = useState('all');
  const exercisesPerPage = 9; // Increased from 10 to 9 for better layout

  // Kinetic theme tokens
  const KINETIC = {
    surface: '#121414',
    surfaceContainer: '#1e2020',
    surfaceContainerLow: '#0c0f0f',
    onSurface: '#e2e2e2',
    onSurfaceVariant: '#e6beb2',
    primary: '#ffb59e',
    primaryHover: '#ff571a',
    primarySoft: 'rgba(255, 87, 26, 0.12)',
    outline: 'rgba(255, 255, 255, 0.1)',
  };

  // Custom styled components
  const GradientButton = styled(Button)({
    background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
    border: 0,
    borderRadius: 0, // SHARP corners
    color: 'white',
    height: 56,
    padding: '0 30px',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    '&:hover': {
      filter: 'brightness(1.1)',
      boxShadow: '0 4px 20px rgba(209, 2, 53, 0.4)',
    },
  });

  const BodyPartButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'active',
  })(({ theme, active }) => ({
    minWidth: 140,
    height: 50,
    borderRadius: 0, // SHARP corners
    textTransform: 'uppercase',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    letterSpacing: '0.1em',
    background: active
      ? 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)'
      : 'transparent',
    color: active ? '#ffffff' : 'rgba(226, 226, 226, 0.6)',
    border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: active
        ? 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)'
        : 'rgba(255, 255, 255, 0.05)',
      borderColor: active ? 'none' : 'rgba(255, 255, 255, 0.4)',
      color: '#ffffff',
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: 110,
      height: 45,
      fontSize: '0.75rem',
    },
  }));

  const ExerciseCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 0, // SHARP corners
    background: '#1e2020',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0 0 20px rgba(255, 87, 26, 0.2)',
      borderColor: 'rgba(255, 87, 26, 0.4)',
    },
  }));

  const CustomPagination = styled(Pagination)(({ theme }) => ({
    '& .MuiPaginationItem-root': {
      color: 'rgba(226, 226, 226, 0.6)',
      fontWeight: 700,
      fontSize: '0.9rem',
      fontFamily: "'Space Grotesk', sans-serif",
      margin: '0 4px',
      minWidth: '40px',
      height: '40px',
      borderRadius: 0, // SHARP corners
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: '#1e2020',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        color: '#ffffff',
      },
    },
    '& .MuiPaginationItem-page.Mui-selected': {
      background: 'linear-gradient(45deg, #d10235 0%, #ff571a 100%)',
      color: 'white',
      border: 'none',
      '&:hover': {
        filter: 'brightness(1.1)',
      },
    },
  }));

  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/exercises/bodyPartList`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setBodyParts(['all', ...data]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBodyParts();
  }, []);

  const fetchYouTubeVideo = async (exerciseName) => {
    try {
      const query = `${exerciseName} exercise tutorial how to`;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&type=video&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&order=relevance&videoDuration=medium`
      );

      if (!response.ok) {
        console.error(`YouTube API error! Status: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.log(`No YouTube videos found for: ${exerciseName}`);
        return null;
      }

      const videoId = data.items[0]?.id?.videoId;
      console.log(`Found video for ${exerciseName}: ${videoId}`);
      return videoId || null;
    } catch (err) {
      console.error("Failed to fetch YouTube video:", err);
      return null;
    }
  };

  // Enhanced function to fetch exercises with multiple endpoints
  const fetchExercises = async (searchTerm, bodyPart) => {
    try {
      setIsLoading(true);
      setError(null);
      setExercises([]);
      setCurrentPage(1);

      let exercises = [];

      // If searching by body part
      if (bodyPart && bodyPart !== 'all') {
        const response = await fetch(`${API_BASE_URL}/exercises/bodyPart/${bodyPart}`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        exercises = data || [];
        console.log(`✅ Fetched ${exercises.length} exercises for body part: ${bodyPart}`);


        // If there's also a search term, filter the results
        if (searchTerm && searchTerm.trim()) {
          exercises = exercises.filter(exercise =>
            exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      }
      // If searching by name only
      else if (searchTerm && searchTerm.trim()) {
        // Try searching by name first
        const nameResponse = await fetch(`${API_BASE_URL}/exercises/name/${searchTerm}`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
        });

        if (nameResponse.ok) {
          const nameData = await nameResponse.json();
          exercises = [...exercises, ...(nameData || [])];
        }

        // Also try searching by target muscle
        const targetResponse = await fetch(`${API_BASE_URL}/exercises/target/${searchTerm}`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
        });

        if (targetResponse.ok) {
          const targetData = await targetResponse.json();
          exercises = [...exercises, ...(targetData || [])];
        }

        // Also try searching by equipment
        const equipmentResponse = await fetch(`${API_BASE_URL}/exercises/equipment/${searchTerm}`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
        });

        if (equipmentResponse.ok) {
          const equipmentData = await equipmentResponse.json();
          exercises = [...exercises, ...(equipmentData || [])];
        }

        // Remove duplicates based on exercise ID
        const uniqueExercises = exercises.filter((exercise, index, self) =>
          index === self.findIndex(e => e.id === exercise.id)
        );
        exercises = uniqueExercises;
      }
      // If no search term and 'all' is selected, fetch a general list
      else {
        const response = await fetch(`${API_BASE_URL}/exercises?limit=100&offset=0`, {
          method: "GET",
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
        });

        if (!response.ok) {
          // Fallback to bodyPart back if the limit/offset doesn't work
          const fallbackResponse = await fetch(`${API_BASE_URL}/exercises/bodyPart/back`, {
            method: "GET",
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            exercises = fallbackData.slice(0, 50) || []; // Limit to 50 for performance
          }
        } else {
          const data = await response.json();
          exercises = data || [];
        }
      }

      if (!exercises || exercises.length === 0) {
        setError("No exercises found for your search criteria.");
        return;
      }

      setExercises(exercises);

      // Enhance with YouTube videos in the background
      exercises.slice(0, 20).forEach(async (exercise) => { // Limit video fetching to first 20 for performance
        setVideoLoading(prev => ({ ...prev, [exercise.id]: true }));
        try {
          const videoId = await fetchYouTubeVideo(exercise.name);
          setExercises(prev =>
            prev.map(ex => ex.id === exercise.id ? { ...ex, videoId } : ex)
          );
        } catch (videoError) {
          console.error(`Error fetching video for ${exercise.name}:`, videoError);
        }
        setVideoLoading(prev => ({ ...prev, [exercise.id]: false }));
      });

    } catch (err) {
      setError("Failed to fetch exercises. Please try again later.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await fetchExercises(search, activeBodyPart);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBodyPartClick = async (bodyPart) => {
    setActiveBodyPart(bodyPart);
    await fetchExercises(search, bodyPart);
  };

  // New function to handle card clicks
  const handleCardClick = (exerciseName) => {
    setSearch(exerciseName.toLowerCase());
    setTimeout(() => {
      fetchExercises(exerciseName.toLowerCase(), activeBodyPart);
    }, 100);
  };

  // Pagination logic
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(exercises.length / exercisesPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{
      background: '#121414',
      minHeight: '100vh',
      py: { xs: '60px', md: '100px' },
      px: { xs: '24px', md: '64px' },
      width: '100%'
    }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={5}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        {/* Search Header */}
        <Stack spacing={2} alignItems="center">
          <Typography
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffb59e',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            Find Your Focus
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: { lg: '48px', xs: '32px' },
              fontWeight: 900,
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#e2e2e2',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            POWERFUL EXERCISES <br />
            FOR <span className="kinetic-text-stroke">YOUR</span> WORKOUT
          </Typography>
        </Stack>

        <Box sx={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          gap: 2,
          position: 'relative'
        }}>
          <TextField
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '56px',
                backgroundColor: '#0c0f0f', // Very dark background
                color: '#e2e2e2',
                fontFamily: "'Hanken Grotesk', sans-serif",
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: '1px',
                  borderRadius: '0px' // SHARP corners
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff571a', // Electric Orange
                  borderWidth: '1.5px',
                }
              },
              '& input::placeholder': {
                color: 'rgba(226, 226, 226, 0.3)',
                opacity: 1
              }
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            onKeyPress={handleKeyPress}
            type="text"
            placeholder="Search Exercises, Muscles, or Equipment..."
          />
          <GradientButton
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'SEARCH'}
          </GradientButton>
        </Box>

        {error && (
          <Box sx={{
            p: 2,
            borderRadius: 0,
            backgroundColor: 'rgba(209, 2, 53, 0.1)',
            borderLeft: `4px solid #d10235`
          }}>
            <Typography color="#ffb4ab" sx={{ textAlign: 'center', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
              {error}
            </Typography>
          </Box>
        )}

        <Box sx={{ width: '100%' }}>
          <Typography sx={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: '#ffb59e',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            mb: 3
          }}>
            Target Areas
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            py: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}>
            {bodyParts.map((part) => (
              <BodyPartButton
                key={part}
                active={activeBodyPart === part}
                onClick={() => handleBodyPartClick(part)}
              >
                {part}
              </BodyPartButton>
            ))}
          </Box>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#ffb59e',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              Workout Library
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Anybody', sans-serif",
                fontSize: { xs: '28px', md: '36px' },
                fontWeight: 900,
                fontStyle: 'italic',
                color: '#e2e2e2',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
              }}
            >
              {exercises.length > 0 ? `${exercises.length} EXERCISES FOUND` : 'EXPLOSIVE MOVEMENTS'}
            </Typography>
          </Stack>

          {isLoading && exercises.length === 0 ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8,
              flexDirection: 'column',
              gap: 3
            }}>
              <CircularProgress size={80} thickness={4} sx={{ color: '#ff571a' }} />
              <Typography variant="h6" color="#ffb59e" fontWeight={600} sx={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Loading exercises...
              </Typography>
            </Box>
          ) : (
            <>
              <Stack spacing={4}>
                {currentExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    onClick={() => handleCardClick(exercise.name)}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        textTransform: 'capitalize',
                        color: KINETIC.onSurface,
                        fontFamily: "'Anybody', sans-serif",
                        fontWeight: 800,
                        fontSize: '1.8rem',
                        fontStyle: 'italic',
                        mb: 3
                      }}
                    >
                      {exercise.name}
                    </Typography>

                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 4,
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                          mb: 3
                        }}>
                          <Box sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 0,
                            p: 1.5,
                            flex: '1 1 200px'
                          }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.15em', fontWeight: 700 }}>
                              BODY PART
                            </Typography>
                            <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ffb59e', textTransform: 'uppercase', mt: 0.5 }}>
                              {exercise.bodyPart}
                            </Typography>
                          </Box>

                          <Box sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 0,
                            p: 1.5,
                            flex: '1 1 200px'
                          }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.15em', fontWeight: 700 }}>
                              EQUIPMENT
                            </Typography>
                            <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ff571a', textTransform: 'uppercase', mt: 0.5 }}>
                              {exercise.equipment}
                            </Typography>
                          </Box>

                          <Box sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 0,
                            p: 1.5,
                            flex: '1 1 200px'
                          }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '10px', color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.15em', fontWeight: 700 }}>
                              TARGET
                            </Typography>
                            <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#ffb59e', textTransform: 'uppercase', mt: 0.5 }}>
                              {exercise.target}
                            </Typography>
                          </Box>
                        </Box>

                        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.1em', fontWeight: 700, mb: 1 }}>
                              SECONDARY MUSCLES
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {exercise.secondaryMuscles.map((muscle, index) => (
                                <Box key={index} sx={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 0,
                                  px: 2,
                                  py: 0.5
                                }}>
                                  <Typography variant="body2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#ff571a', textTransform: 'uppercase', fontSize: '12px' }}>
                                    {muscle}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        <Box>
                          <Typography variant="subtitle2" sx={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', color: 'rgba(226, 226, 226, 0.4)', letterSpacing: '0.1em', fontWeight: 700, mb: 1 }}>
                            INSTRUCTIONS
                          </Typography>
                          <Box component="ol" sx={{
                            pl: 2,
                            '& li': { mb: 1 }
                          }}>
                            {exercise.instructions && exercise.instructions.length > 0 ? (
                              exercise.instructions.slice(0, 5).map((instruction, index) => (
                                <li key={index}>
                                  <Typography variant="body1" sx={{ fontFamily: "'Hanken Grotesk', sans-serif", color: 'rgba(226, 226, 226, 0.8)', fontSize: '14px' }}>
                                    {instruction}
                                  </Typography>
                                </li>
                              ))
                            ) : (
                              <Typography sx={{ color: 'rgba(226, 226, 226, 0.4)', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '14px' }}>
                                No instructions available
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{
                        flex: 1,
                        width: '100%',
                        minHeight: '300px',
                        borderRadius: 0, // SHARP corners
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#0c0f0f',
                        border: `1px solid rgba(255, 255, 255, 0.1)`
                      }}>
                        {videoLoading[exercise.id] ? (
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            flexDirection: 'column',
                            gap: 2,
                            background: `linear-gradient(45deg, rgba(255, 87, 26, 0.05) 0%, rgba(255,138,0,0.02) 100%)`
                          }}>
                            <CircularProgress size={60} sx={{ color: '#ff571a' }} />
                            <Typography variant="body2" color="#ffb59e" fontWeight={600} sx={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              Loading video tutorial...
                            </Typography>
                          </Box>
                        ) : exercise.videoId ? (
                          <Box sx={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            minHeight: '300px'
                          }}>
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${exercise.videoId}?modestbranding=1&rel=0&showinfo=0&fs=1&autoplay=0`}
                              title={`${exercise.name} tutorial`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{
                                borderRadius: '0px', // SHARP corners
                                minHeight: '300px',
                                border: 0,
                              }}
                            />

                            <Box sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              zIndex: 1
                            }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://www.youtube.com/watch?v=${exercise.videoId}`, '_blank');
                                }}
                                className="kinetic-button-gradient"
                                sx={{
                                  color: 'white',
                                  minWidth: 'auto',
                                  px: 2,
                                  py: 1,
                                  fontSize: '11px',
                                  letterSpacing: '0.1em',
                                }}
                              >
                                Watch on YouTube
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            p: 4,
                            textAlign: 'center',
                            flexDirection: 'column',
                            gap: 2,
                            background: `linear-gradient(45deg, rgba(255, 87, 26, 0.05) 0%, rgba(255,138,0,0.02) 100%)`
                          }}>
                            <Typography color="#ffb59e" variant="h6" fontWeight={700} sx={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              Video Tutorial Not Available
                            </Typography>
                            <Typography color="rgba(226, 226, 226, 0.6)" variant="body2" sx={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
                              We couldn't find a video for this exercise. Try searching YouTube for "{exercise.name} exercise".
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercise')}`, '_blank');
                              }}
                              className="kinetic-button-ghost"
                              sx={{
                                px: 3,
                                py: 1,
                                fontSize: '11px',
                                letterSpacing: '0.15em',
                              }}
                            >
                              Search YouTube
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </ExerciseCard>
                ))}
              </Stack>

              {exercises.length > exercisesPerPage && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 6,
                  py: 4,
                  flexDirection: 'column',
                  gap: 3
                }}>
                  <Typography variant="body2" color="#ffb59e" fontWeight={600} sx={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.05em' }}>
                    SHOWING {indexOfFirstExercise + 1} - {Math.min(indexOfLastExercise, exercises.length)} OF {exercises.length} EXERCISES
                  </Typography>
                  <CustomPagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    size="large"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    siblingCount={2}
                    boundaryCount={1}
                    renderItem={(item) => (
                      <PaginationItem
                        slots={{
                          previous: ChevronLeft,
                          next: ChevronRight,
                          first: () => <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '11px' }}>FIRST</Typography>,
                          last: () => <Typography sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '11px' }}>LAST</Typography>
                        }}
                        {...item}
                      />
                    )}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default Search;