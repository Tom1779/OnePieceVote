import Image from "next/image";
import { X } from "lucide-react";

export default function ImageModal({ src, alt, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[80vw] max-h-[80vh] bg-gray-900 rounded-xl flex items-center justify-center">
        <Image
          src={src}
          alt={alt || "Image"}
          width={500}
          height={500}
          style={{ objectFit: "contain" }}
          className="rounded-xl"
          unoptimized
        />
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
