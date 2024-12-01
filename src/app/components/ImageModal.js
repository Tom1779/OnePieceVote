import Image from "next/image";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ImageModal({ src, alt, onClose }) {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
    maxWidth: 0,
    maxHeight: 0,
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      // Calculate maximum dimensions
      const maxWidth = window.innerWidth; // Increased from 0.8 to 0.9
      const maxHeight = window.innerHeight; // Increased from 0.8 to 0.9

      const aspectRatio = img.width / img.height;

      let newWidth, newHeight;
      if (img.width > maxWidth || img.height > maxHeight) {
        if (aspectRatio > 1) {
          // Wide image
          newWidth = Math.min(img.width, maxWidth);
          newHeight = newWidth / aspectRatio;

          // Adjust height if it's still too tall
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
        } else {
          // Tall image
          newHeight = Math.min(img.height, maxHeight);
          newWidth = newHeight * aspectRatio;

          // Adjust width if it's still too wide
          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
          }
        }
      } else {
        // Image is smaller than max dimensions
        newWidth = img.width;
        newHeight = img.height;
      }

      setImageDimensions({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        maxWidth,
        maxHeight,
      });
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setImageError(true);
    };
  }, [src]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (imageError) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-red-600 text-white p-6 rounded-xl text-center">
          <p>Unable to load image</p>
          <button
            onClick={onClose}
            className="mt-4 bg-red-800 hover:bg-red-700 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-gray-900 rounded-xl flex items-center justify-center"
        style={{
          width: imageDimensions.width,
          height: imageDimensions.height,
          maxWidth: imageDimensions.maxWidth,
          maxHeight: imageDimensions.maxHeight,
        }}
      >
        {imageDimensions.width > 0 && (
          <Image
            src={src}
            alt={alt || "Image"}
            width={imageDimensions.width}
            height={imageDimensions.height}
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            className="rounded-xl"
            onError={() => setImageError(true)}
            unoptimized
          />
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/75 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close image"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
