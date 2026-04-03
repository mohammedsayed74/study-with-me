import React, { useState } from 'react';
import { HiOutlineStar, HiStar } from 'react-icons/hi2';
import axios from 'axios';

const StarRating = ({ material }) => {
  const [hoverValue, setHoverValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [ratingData, setRatingData] = useState({
    averageRating: material.averageRating || 0,
    totalRatings: material.totalRatings || 0
  });

  const handleMouseEnter = (index) => {
    if (!isLoading) setHoverValue(index);
  };

  const handleMouseLeave = () => {
    if (!isLoading) setHoverValue(null);
  };

  const handleClick = async (score) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await axios.patch(`/api/materials/${material._id}/rate`, { score }, { headers });
      
      const updatedMaterial = res.data.data;
      setRatingData({
        averageRating: updatedMaterial.averageRating,
        totalRatings: updatedMaterial.totalRatings
      });
      setHoverValue(null);
    } catch (err) {
      alert("Failed to rate material: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const stars = [1, 2, 3, 4, 5];
  
  // Calculate exactly what percentage of the stars should be filled.
  // If user is hovering a star, fill completely up to that star.
  // Otherwise, display exact average rating fraction (e.g. 4.25 / 5).
  const displayRating = hoverValue !== null ? hoverValue : ratingData.averageRating;
  const fillPercentage = (displayRating / 5) * 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 0 }}>
      
      {/* Relative container for the star layers */}
      <div 
        style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity: isLoading ? 0.6 : 1 }}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* BASE LAYER: Empty Stars */}
        <div style={{ display: 'flex' }}>
          {stars.map((index) => (
            <HiOutlineStar
              key={index}
              size={22}
              color="#D1D5DB" // text-gray-300
              style={{
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.15s ease',
                transform: hoverValue === index ? 'scale(1.15)' : 'scale(1)',
                flexShrink: 0
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>

        {/* TOP LAYER MAGIC WRAPPER: Filled Stars Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${fillPercentage}%`,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: hoverValue ? 'none' : 'width 0.2s ease-in-out' // snap on hover, smooth on data arrival
        }}>
          {/* Inner flex row perfectly matching the base layer */}
          <div style={{ display: 'flex', width: 'max-content' }}>
            {stars.map((index) => (
              <HiStar
                key={index}
                size={22}
                color="#FBBF24" // text-amber-400
                style={{
                  transition: 'transform 0.15s ease',
                  transform: hoverValue === index ? 'scale(1.15)' : 'scale(1)',
                  flexShrink: 0
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* TEXT LAYER */}
      <div style={{ 
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        fontWeight: '700',
        color: '#000000',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        {ratingData.averageRating.toFixed(1)} ★ 
        <span style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: '500' }}>
          ({ratingData.totalRatings})
        </span>
      </div>

    </div>
  );
};

export default StarRating;
