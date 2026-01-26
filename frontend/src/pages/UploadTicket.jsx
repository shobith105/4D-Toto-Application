import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadTicket } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
      
      // Navigate to verify page with ticket data (extract data field from response)
      navigate('/verify', { state: { ticketData: result.data } });
    } catch (error) {
      console.error('Upload error:', error);
      alert(`${error.response.data.detail}`);
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
    <div className="min-h-screen text-white p-6" style={{backgroundColor: '#020617'}}>
      {/* Loading Overlay */}
      {uploading && <LoadingSpinner message="Processing Ticket" />}
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur mb-4" style={{background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
            <svg className="w-7 h-7" style={{color: '#10b981'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Ticket</h1>
          <p style={{color: '#cbd5e1'}}>Snap a photo or upload from gallery</p>
        </div>

        {/* Upload Card */}
        <div className="rounded-2xl shadow-2xl p-8" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Camera View */}
            {isCameraOpen ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden" style={{border: '2px solid #334155', background: '#000'}}>
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
                    className="flex-1 py-3 rounded-lg font-semibold transition-all"
                    style={{background: '#0f172a', border: '1px solid #1e293b', color: 'white'}}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#334155'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-3 rounded-lg font-semibold transition-all"
                    style={{background: '#10b981', color: 'white'}}
                    onMouseEnter={(e) => e.target.style.background = '#059669'}
                    onMouseLeave={(e) => e.target.style.background = '#10b981'}
                  >
                    📸 Capture
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Preview Area */}
                {preview ? (
                  <div className="rounded-lg overflow-hidden" style={{border: '2px solid #334155'}}>
                    <img 
                      src={preview} 
                      alt="Ticket preview" 
                      className="w-full h-auto object-contain max-h-96"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg p-16 text-center" style={{border: '2px dashed #334155', background: '#1e293b'}}>
                    <svg 
                      className="w-16 h-16 mx-auto mb-4" 
                      style={{color: '#64748b'}}
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
                    <p className="font-semibold text-white mb-1">Drag & Drop your ticket here</p>
                    <p className="text-sm" style={{color: '#94a3b8'}}>or choose an option below</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={openCamera}
                    className="flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer transition-all"
                    style={{border: '2px solid #334155', background: '#1e293b'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7c3aed';
                      e.currentTarget.style.background = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#334155';
                      e.currentTarget.style.background = '#1e293b';
                    }}
                  >
                    <svg 
                      className="w-10 h-10 mb-2" 
                      style={{color: '#cbd5e1'}}
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
                    <span className="text-sm font-medium text-white">Take Photo</span>
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
                      className="flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer transition-all"
                      style={{border: '2px solid #334155', background: '#1e293b'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.background = '#0f172a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#334155';
                        e.currentTarget.style.background = '#1e293b';
                      }}
                    >
                      <svg 
                        className="w-10 h-10 mb-2" 
                        style={{color: '#cbd5e1'}}
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
                      <span className="text-sm font-medium text-white">Choose from Gallery</span>
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
                  className="flex-1 py-3 rounded-lg font-semibold transition-all"
                  style={{background: '#0f172a', border: '1px solid #1e293b', color: 'white'}}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#334155'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: uploading ? '#64748b' : '#10b981',
                    color: 'white',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) e.target.style.background = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    if (!uploading) e.target.style.background = '#10b981';
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Ticket'}
                </button>
              </div>
            )}
          </form>

          {/* Info Text */}
          {!isCameraOpen && (
            <div className="mt-6 p-4 rounded-lg" style={{background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)'}}>
              <p className="text-sm" style={{color: '#cbd5e1'}}>
                <strong style={{color: '#a78bfa'}}>Tip:</strong> Make sure the ticket numbers are clearly visible for best results.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-medium transition-colors"
            style={{color: '#94a3b8'}}
            onMouseEnter={(e) => e.target.style.color = '#cbd5e1'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
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