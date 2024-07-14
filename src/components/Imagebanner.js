import React, { useEffect, useRef } from 'react';
import '../styling/Imagebanner.css';
import images from '../styling/Images';

const getRandomImages = (arr, num) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

const ImageBanner = () => {
  const scrollContainerRef = useRef(null);
  const randomImagesRef = useRef(getRandomImages(images, 10));
  const animationRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const totalWidth = scrollContainer.scrollWidth / 2; // Width of the original set of images
    let scrollAmount = 0;

    const scrollImages = () => {
      scrollAmount -= 0.5;
      if (scrollAmount <= -totalWidth) {
        scrollAmount = 0;
      }
      scrollContainer.style.transform = `translateX(${scrollAmount}px)`;
      animationRef.current = requestAnimationFrame(scrollImages);
    };

    scrollImages();

    const handleMouseEnter = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleMouseLeave = () => {
      scrollImages();
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const randomImages = randomImagesRef.current;

  return (
    <div className="banner-container">
      <div className="scroll-container" ref={scrollContainerRef}>
        {randomImages.concat(randomImages).map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={`Picture missing`} className="image" />
        ))}
      </div>
    </div>
  );
};

export default ImageBanner;
