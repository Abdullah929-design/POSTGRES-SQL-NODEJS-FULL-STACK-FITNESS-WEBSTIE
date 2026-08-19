import Box from '@mui/material/Box';
import Banner from '../components/Banner';
import FeaturesSection from '../components/FeaturesSection';
import WhyKineticSection from '../components/WhyKineticSection';
import GymGallerySection from '../components/GymGallerySection';
import TestimonialsSection from '../components/TestimonialsSection';

const Home = () => {
  return (
    <Box>
      {/* 1. Hero — existing */}
      <Banner />

      {/* 2. Features (Track / Move / Know) — existing */}
      <FeaturesSection />

      {/* 3. Why Kinetic — NEW */}
      <WhyKineticSection />

      {/* 4. Gym Gallery — NEW */}
      <GymGallerySection />

      {/* 5. Testimonials + final CTA — NEW */}
      <TestimonialsSection />
    </Box>
  );
};

export default Home;