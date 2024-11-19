import Image from "next/image";

export default function ImageModal({ src, alt, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={700}
          height={700}
          style={{ objectFit: "contain" }}
          className="rounded-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-lg bg-black bg-opacity-50 rounded-full px-4 py-2 hover:bg-opacity-75 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
