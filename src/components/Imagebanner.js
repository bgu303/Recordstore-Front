import React from 'react';
import '../styling/Imagebanner.css';

const ImageBanner = () => {
  const images = [
    "https://cdn.pixabay.com/photo/2020/04/02/10/00/record-player-4994400_1280.jpg",
    "https://cdn.pixabay.com/photo/2019/12/18/04/11/dj-4702977_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/07/23/20/00/record-3557751_960_720.jpg",
    "https://cdn.britannica.com/18/136518-050-CD0E49C6/The-Beatles-Ringo-Starr-Paul-McCartney-George.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
    "https://cdns-images.dzcdn.net/images/artist/935d35a45e061e7640a0becfa42cef6e/1900x1900-000000-80-0-0.jpg",
    "https://m.media-amazon.com/images/I/817NMar7SgL._UF1000,1000_QL80_.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/The_Doors_1968.JPG/1200px-The_Doors_1968.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/f/f8/Ramones_rocket_to_russia_photo.jpg",
    "https://cdns-images.dzcdn.net/images/cover/7ed7d6130119c3a0afa60499ae8e9599/1900x1900-000000-80-0-0.jpg",
    "https://www.soundi.fi/wp-content/uploads/old/1375233632_Elvis-Presley-672x504.jpg",
    "https://levyikkuna.fi/tiedostot/119/kuva/tuote/600/4709.jpg",
    "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1500w,f_auto,q_auto:best/newscms/2018_34/2536976/180820-the-eagles-henley-frey-walsh-mn-0915.jpg",
    "https://www.udiscovermusic.com/wp-content/uploads/2020/11/Metallica-GettyImages-531257207-1000x600.jpg"
  ];

  return (
    <div className="banner-container">
      <div className="scroll-container">
        {images.map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={`Picture missing`} className="image" />
        ))}
      </div>
    </div>
  );
};

export default ImageBanner;
