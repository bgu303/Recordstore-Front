import React, { useEffect, useRef, useState } from 'react';
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

  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const totalWidth = scrollContainer.scrollWidth / 2; // Width of the original set of images
    let scrollAmount = 0;

    const scrollImages = () => {
      scrollAmount -= 0.25;
      if (scrollAmount <= -totalWidth) {
        scrollAmount = 0;
      }
      scrollContainer.style.transform = `translateX(${scrollAmount}px)`;
      animationRef.current = requestAnimationFrame(scrollImages);
    };
    scrollImages();
  }, []);

  const randomImages = randomImagesRef.current;

  const openPreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  return (
    <div className="banner-container">
      <div className="scroll-container" ref={scrollContainerRef}>
        {randomImages.concat(randomImages).map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`Picture missing`}
            className="image"
            onClick={() => openPreview(imageUrl)}
          />
        ))}
      </div>
      {showPreview && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-container">
            <img src={previewImage} alt="Preview" className="preview-image" />
            <button className="close-preview" onClick={closePreview}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBanner;
