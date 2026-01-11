import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadTicket } from '../services/api';

export default function UploadTicket() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Creates preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'environment' }, // Use back camera on mobile
        audio: false
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Wait for next render cycle
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 0);
    } catch (error) {
      console.error('Camera access error:', error);
      if (error.name === 'NotAllowedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device.');
      } else {
        alert('Failed to access camera. Please try again.');
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'ticket-photo.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreview(canvas.toDataURL('image/jpeg', 0.95));
        closeCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);

    try {
      // Upload ticket for immediate OCR processing
      const result = await uploadTicket(selectedFile);
      
      alert('Ticket processed successfully!');
      console.log('Ticket data:', result);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload ticket');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    closeCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-rose-500 to-orange-400 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur mb-4">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Ticket</h1>
          <p className="text-white/90">Snap a photo or upload from gallery</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Camera View */}
            {isCameraOpen ? (
              <div className="space-y-4">
                <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    📸 Capture
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Preview Area */}
                {preview ? (
                  <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Ticket preview" 
                      className="w-full h-auto object-contain max-h-96"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center bg-slate-50">
                    <svg 
                      className="w-16 h-16 mx-auto mb-4 text-slate-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p className="text-slate-600 font-medium">No image selected</p>
                    <p className="text-sm text-slate-500 mt-1">Choose an option below</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg 
                      className="w-10 h-10 mb-2 text-slate-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">Take Photo</span>
                  </button>

                  {/* Gallery Button */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="gallery-input"
                    />
                    <label
                      htmlFor="gallery-input"
                      className="flex flex-col items-center justify-center p-6 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg 
                        className="w-10 h-10 mb-2 text-slate-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">Choose from Gallery</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Upload/Clear Buttons */}
            {selectedFile && !isCameraOpen && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Ticket'}
                </button>
              </div>
            )}
          </form>

          {/* Info Text */}
          {!isCameraOpen && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure the ticket numbers are clearly visible for best results.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/90 hover:text-white font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Hidden canvas for capturing photo */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}