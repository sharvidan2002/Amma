import { useState, useCallback, useRef } from 'react';
import { fileToBase64 } from '../lib/utils';
import { APP_CONFIG } from '../lib/constants';

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseImageCropOptions {
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
  quality?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface UseImageCropReturn {
  // State
  originalImage: string | null;
  croppedImage: string | null;
  isProcessing: boolean;
  error: string | null;

  // File handling
  handleFileSelect: (file: File) => Promise<void>;
  handleFileDrop: (files: FileList) => Promise<void>;

  // Cropping
  setCropData: (cropData: CropData) => void;
  applyCrop: () => Promise<string | null>;
  resetCrop: () => void;

  // Image operations
  rotateImage: (degrees: number) => void;
  flipImage: (horizontal?: boolean) => void;

  // Cleanup
  clearImages: () => void;

  // Validation
  validateFile: (file: File) => { isValid: boolean; error?: string };
}

export const useImageCrop = (options: UseImageCropOptions = {}): UseImageCropReturn => {
  const {
    aspectRatio = APP_CONFIG.imageAspectRatio,
    outputWidth = APP_CONFIG.defaultImageWidth,
    outputHeight = APP_CONFIG.defaultImageHeight,
    quality = 0.8,
    maxFileSize = APP_CONFIG.maxImageSize,
    allowedTypes = APP_CONFIG.supportedImageTypes,
  } = options;

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>();

  // File validation
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not supported. Please use: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`
      };
    }

    return { isValid: true };
  }, [allowedTypes, maxFileSize]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File): Promise<void> => {
    setError(null);
    setIsProcessing(true);

    try {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setCroppedImage(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    } catch (err) {
      setError('Failed to load image');
      console.error('Image loading error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [validateFile]);

  // Handle file drop
  const handleFileDrop = useCallback(async (files: FileList): Promise<void> => {
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Create canvas for image processing
  const createCanvas = useCallback((): HTMLCanvasElement => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    return canvasRef.current;
  }, []);

  // Load image into canvas
  const loadImageToCanvas = useCallback((
    imageSrc: string,
    canvas: HTMLCanvasElement
  ): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageSrc;
    });
  }, []);

  // Apply transformations to canvas
  const applyTransformations = useCallback((
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvas: HTMLCanvasElement
  ) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);

    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    if (flipH || flipV) {
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    }

    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }, [rotation, flipH, flipV]);

  // Apply crop
  const applyCrop = useCallback(async (): Promise<string | null> => {
    if (!originalImage || !cropData) return null;

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = createCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = await loadImageToCanvas(originalImage, canvas);

      // Set canvas size to crop dimensions
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Calculate scale factors
      const scaleX = outputWidth / cropData.width;
      const scaleY = outputHeight / cropData.height;

      ctx.fillStyle = '#fff'; // White background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(scaleX, scaleY);
      ctx.translate(-cropData.x, -cropData.y);

      // Apply transformations
      applyTransformations(ctx, img, canvas);

      ctx.restore();

      // Convert to base64
      const croppedDataUrl = canvas.toDataURL('image/jpeg', quality);
      setCroppedImage(croppedDataUrl);

      return croppedDataUrl;
    } catch (err) {
      setError('Failed to crop image');
      console.error('Crop error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, cropData, outputWidth, outputHeight, quality, createCanvas, loadImageToCanvas, applyTransformations]);

  // Reset crop
  const resetCrop = useCallback(() => {
    setCropData(null);
    setCroppedImage(null);
  }, []);

  // Rotate image
  const rotateImage = useCallback((degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
    setCroppedImage(null); // Clear cropped image when rotating
  }, []);

  // Flip image
  const flipImage = useCallback((horizontal: boolean = true) => {
    if (horizontal) {
      setFlipH(prev => !prev);
    } else {
      setFlipV(prev => !prev);
    }
    setCroppedImage(null); // Clear cropped image when flipping
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    setOriginalImage(null);
    setCroppedImage(null);
    setCropData(null);
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  return {
    // State
    originalImage,
    croppedImage,
    isProcessing,
    error,

    // File handling
    handleFileSelect,
    handleFileDrop,

    // Cropping
    setCropData,
    applyCrop,
    resetCrop,

    // Image operations
    rotateImage,
    flipImage,

    // Cleanup
    clearImages,

    // Validation
    validateFile,
  };
};