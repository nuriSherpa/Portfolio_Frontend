// src/app/(cms-portal)/components/blog/image-upload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ currentImage, onUpload, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onUpload(data.data.url);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (currentImage) {
    return (
      <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border">
        <Image src={currentImage} alt="Featured" fill className="object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="w-full max-w-md aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      ) : (
        <>
          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click to upload featured image</p>
          <p className="text-xs text-gray-400 mt-1">Recommended: 1200x630px</p>
        </>
      )}
    </div>
  );
}
