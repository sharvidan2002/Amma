import React, { useState, useRef, useCallback } from 'react';
import { Upload, Crop, RotateCcw, Check, X, Camera } from 'lucide-react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { fileToBase64, formatFileSize } from '../../lib/utils';
import { APP_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface ImageCropperProps {
  value?: string; // Base64 image string
  onChange: (base64Image: string | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  value,
  onChange,
  label = "Employee Photo",
  required = false,
  disabled = false,
  error,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!APP_CONFIG.supportedImageTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > APP_CONFIG.maxImageSize) {
      alert(`File size must be less than ${formatFileSize(APP_CONFIG.maxImageSize)}`);
      return;
    }

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setIsOpen(true);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing the selected file');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const getCropData = () => {
    const cropper = (cropperRef.current as any)?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas({
        width: APP_CONFIG.defaultImageWidth,
        height: APP_CONFIG.defaultImageHeight,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      const croppedImageUrl = croppedCanvas.toDataURL('image/jpeg', 0.8);
      setCroppedImage(croppedImageUrl);
      onChange(croppedImageUrl);
      setIsOpen(false);
    }
  };

  const handleRemoveImage = () => {
    setCroppedImage(null);
    onChange(null);
    setOriginalImage(null);
  };

  const handleRotate = () => {
    const cropper = (cropperRef.current as any)?.cropper;
    if (cropper) {
      cropper.rotate(90);
    }
  };

  const resetCrop = () => {
    const cropper = (cropperRef.current as any)?.cropper;
    if (cropper) {
      cropper.reset();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-crimson-600 ml-1">*</span>}
        </Label>
      )}

      {/* Image Display/Upload Area */}
      <div className="space-y-4">
        {croppedImage ? (
          // Display cropped image
          <div className="relative inline-block">
            <img
              src={croppedImage}
              alt="Employee"
              className="w-32 h-32 object-cover border-2 border-pearl-300 rounded-lg shadow-sm"
            />
            <div className="absolute -top-2 -right-2 flex space-x-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-6 w-6 bg-white shadow-md"
                onClick={() => {
                  setOriginalImage(croppedImage);
                  setIsOpen(true);
                }}
                disabled={disabled}
              >
                <Crop className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-6 w-6 bg-white shadow-md text-red-600 hover:text-red-700"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          // Upload area
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              isDragging
                ? "border-crimson-500 bg-crimson-50"
                : "border-pearl-300 hover:border-pearl-400",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={APP_CONFIG.supportedImageTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crimson-600"></div>
                <p className="text-sm text-slate-custom-600">Processing image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Camera className="h-12 w-12 text-slate-custom-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-custom-700">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-xs text-slate-custom-500">
                    Supports JPEG, PNG, WebP (max {formatFileSize(APP_CONFIG.maxImageSize)})
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Crop Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Employee Photo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {originalImage && (
              <div className="relative">
                <Cropper
                  ref={cropperRef}
                  src={originalImage}
                  style={{ height: 400, width: '100%' }}
                  initialAspectRatio={APP_CONFIG.imageAspectRatio}
                  aspectRatio={APP_CONFIG.imageAspectRatio}
                  guides={true}
                  checkOrientation={false}
                  cropBoxMovable={true}
                  cropBoxResizable={true}
                  toggleDragModeOnDblclick={false}
                  minCropBoxHeight={100}
                  minCropBoxWidth={100}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                  viewMode={1}
                />
              </div>
            )}

            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetCrop}
              >
                Reset
              </Button>
            </div>

            <div className="text-sm text-slate-custom-600 bg-pearl-50 p-3 rounded-md">
              <p><strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Drag to move the crop area</li>
                <li>Drag corners to resize</li>
                <li>Image will be resized to {APP_CONFIG.defaultImageWidth}x{APP_CONFIG.defaultImageHeight} pixels</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={getCropData}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCropper;