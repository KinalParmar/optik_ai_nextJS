// components/DotLoader.jsx
import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';

// Styled component for the dot
const Dot = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: '16px',
  height: '16px',
  backgroundColor: '#fff',
  borderRadius: '50%',
  margin: '0 6px',
  position: 'relative', // Needed for shadow positioning
  animation: 'dotBouncing 0.6s infinite ease-in-out',
  '&:nth-of-type(2)': {
    animationDelay: '0.2s',
  },
  '&:nth-of-type(3)': {
    animationDelay: '0.4s',
  },
  // Add shadow animation
  '&:before': {
    content: '""',
    position: 'absolute',
    bottom: '-10px', // Position the shadow below the dot
    left: '50%',
    transform: 'translateX(-50%)',
    width: '12px',
    height: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent shadow
    borderRadius: '50%',
    animation: 'shadowBouncing 0.6s infinite ease-in-out',
    // Match the delay with the dot's bounce
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
  // Bouncing animation for the dot
  '@keyframes dotBouncing': {
    '0%, 100%': {
      transform: 'translateY(0)', // Bottom position
    },
    '50%': {
      transform: 'translateY(-15px)', // Top position
    },
  },
  // Shadow animation
  '@keyframes shadowBouncing': {
    '0%, 100%': {
      transform: 'translateX(-50%) scale(1)', // Larger shadow when dot is at the bottom
      opacity: 0.5,
    },
    '50%': {
      transform: 'translateX(-50%) scale(0.5)', // Smaller shadow when dot is at the top
      opacity: 0.2,
    },
  },
}));

const DotLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for visibility
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
      }}
    >
      <Dot />
      <Dot />
      <Dot />
    </Box>
  );
};

export default DotLoader;