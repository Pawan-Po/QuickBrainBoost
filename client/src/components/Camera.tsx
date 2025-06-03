import { useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { extractProductFromImage } from '@/lib/ocr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Camera, RotateCcw, Zap, ZapOff, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (extractedData: any, imageData: string) => void;
}

export function CameraComponent({ isOpen, onClose, onCapture }: CameraProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const {
    isStreaming,
    error,
    flashEnabled,
    videoRef,
    canvasRef,
    closeCamera,
    capturePhoto,
    switchCamera,
    toggleFlash,
  } = useCamera();

  const handleClose = () => {
    closeCamera();
    onClose();
  };

  const handleCapture = async () => {
    try {
      setIsProcessing(true);
      
      const imageData = capturePhoto();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      toast({
        title: "Processing image...",
        description: "Extracting product information using OCR",
      });

      const extractedData = await extractProductFromImage(imageData);
      
      closeCamera();
      onCapture(extractedData, imageData);
      onClose();
      
      toast({
        title: "Image processed successfully",
        description: "Product information has been extracted",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "Failed to extract product information from image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        toast({
          title: "Processing image...",
          description: "Extracting product information using OCR",
        });

        try {
          const extractedData = await extractProductFromImage(imageData);
          closeCamera();
          onCapture(extractedData, imageData);
          onClose();
          
          toast({
            title: "Image processed successfully",
            description: "Product information has been extracted",
          });
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: "Processing failed",
            description: "Failed to extract product information from image",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "File error",
        description: "Failed to read the selected image file",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full h-full p-0 bg-black">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
            <h2 className="text-lg font-medium">Scan Product</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlash}
              className="text-white hover:bg-white/10"
            >
              {flashEnabled ? <Zap className="h-6 w-6" /> : <ZapOff className="h-6 w-6" />}
            </Button>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative">
            {error ? (
              <div className="h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Camera Error</p>
                  <p className="text-sm opacity-75">{error}</p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Scanner Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-60 border-2 border-blue-500 rounded-lg animate-pulse">
                    <div className="w-full h-full flex items-center justify-center">
                      {!isStreaming && (
                        <span className="text-white text-center">
                          <Camera className="h-8 w-8 mx-auto mb-2" />
                          Position product label within frame
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-700 font-medium">Processing image...</p>
                      <p className="text-sm text-gray-500 mt-1">Extracting product information</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-black/50">
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                className="text-white hover:bg-white/10 p-4"
                disabled={!isStreaming || isProcessing}
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              
              <Button
                size="icon"
                onClick={handleCapture}
                disabled={!isStreaming || isProcessing}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-8 w-8" />
              </Button>
              
              <label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 p-4"
                  disabled={isProcessing}
                  asChild
                >
                  <span>
                    <Image className="h-6 w-6" />
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
