import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, Check, RefreshCw, AlertCircle, Shield } from 'lucide-react';

interface CustomerPhotoViewProps {
  currentPhotoUrl: string | null;
  onPhotoSelected: (file: File | null, previewUrl: string) => void;
  onContinue: () => void;
}

export const CustomerPhotoView: React.FC<CustomerPhotoViewProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  onContinue,
}) => {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [consentGiven, setConsentGiven] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream if active on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Photo exceeds 15 MB limit. Please select a smaller image.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onPhotoSelected(file, previewUrl);
    stopCamera();
  };

  const handleUseDemoModel = () => {
    const demoUrl = '/uploads/customers/demo-model.webp';
    setPreview(demoUrl);
    onPhotoSelected(null, demoUrl);
    stopCamera();
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 768 }, height: { ideal: 1024 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 768;
    canvas.height = video.videoHeight || 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `customer-capture-${Date.now()}.png`, { type: 'image/png' });
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onPhotoSelected(file, previewUrl);
        stopCamera();
      },
      'image/png',
      0.95
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
          Step 1: Customer Photo
        </h2>
        <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
          Upload or capture a full-body, front-facing photo to preview outfits tailored to your posture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Capture/Preview Box */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {isCameraActive ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[3/4] flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : preview ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[3/4] border border-slate-200 flex items-center justify-center">
              <img
                src={preview}
                alt="Customer preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur shadow-sm">
                <Check className="w-3.5 h-3.5" />
                Photo Ready
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 aspect-[3/4] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white text-slate-400 flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-slate-800 text-base mb-1">
                No Customer Photo Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-6">
                Upload from your device, take a live photo, or use our verified demo model for an instant preview.
              </p>
              <div className="flex flex-col w-full max-w-xs gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
                <button
                  onClick={startCamera}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-slate-600" />
                  Use Web Camera
                </button>
                <button
                  onClick={handleUseDemoModel}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-emerald-200"
                >
                  <span>⚡ 1-Click Demo Model</span>
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Row if preview is active */}
          {preview && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace Photo
                </button>
                <button
                  onClick={handleUseDemoModel}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100"
                >
                  Use Demo Model
                </button>
              </div>
              <span className="text-[11px] text-slate-400">JPEG, PNG, WebP &lt; 15MB</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Right: Best Practice Guidelines & Consent */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Recommended Photo Guidelines
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-emerald-700">•</span>
                <span><strong>Front-Facing & Standing:</strong> Stand straight facing the camera with feet grounded.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-emerald-700">•</span>
                <span><strong>Full Body Visibility:</strong> Ensure shoulders down to knees/feet are in frame.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-emerald-700">•</span>
                <span><strong>Arm Spacing:</strong> Keep arms slightly relaxed away from your torso for clean segmentation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-emerald-700">•</span>
                <span><strong>Balanced Lighting:</strong> Avoid heavy backlighting or strong overhead shadows.</span>
              </li>
            </ul>
          </div>

          {/* Privacy Consent */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  Customer Privacy & Temporary Use
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mb-3">
                  Your photo is used strictly to generate your virtual fitting preview during this session. It is never used for biometric facial recognition or stored permanently.
                </p>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    I consent to temporary processing
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Continue CTA */}
          <button
            onClick={onContinue}
            disabled={!preview || !consentGiven}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
              preview && consentGiven
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/10'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Continue to Outfit Selection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
