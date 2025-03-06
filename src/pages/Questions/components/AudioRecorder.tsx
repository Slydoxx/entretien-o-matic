
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";

type AudioRecorderProps = {
  status: string;
  startRecording: () => void;
  stopRecording: () => void;
  isTranscribing: boolean;
};

const AudioRecorder = ({ status, startRecording, stopRecording, isTranscribing }: AudioRecorderProps) => {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [showPermissionHint, setShowPermissionHint] = useState(false);

  useEffect(() => {
    // Check if we're in a secure context (required for getUserMedia on mobile)
    const secure = window.isSecureContext;
    setIsSecureContext(secure);
    
    if (!secure) {
      console.error("Audio recording requires a secure context (HTTPS)");
    }
    
    // Reset permission state when status changes
    if (status === "idle") {
      setPermissionDenied(false);
    }
  }, [status]);

  const handleStartRecording = async () => {
    try {
      // Show permission hint before requesting microphone access
      setShowPermissionHint(true);
      
      // Short delay to ensure the hint is shown
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for microphone permission first
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      // If we got here, permission was granted, so start recording
      console.log("Microphone permission granted, starting recording");
      setShowPermissionHint(false);
      startRecording();
    } catch (err) {
      console.error("Microphone permission error:", err);
      setPermissionDenied(true);
      setShowPermissionHint(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {showPermissionHint && (
        <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded-md text-center mb-2 animate-fade-in">
          Pensez à autoriser l'accès à votre microphone dans le navigateur.
        </div>
      )}
      
      {!isSecureContext && (
        <div className="text-xs text-red-500 text-center mb-2">
          L'enregistrement audio nécessite HTTPS. Veuillez utiliser un site sécurisé.
        </div>
      )}
      
      {permissionDenied && (
        <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded-md text-center mb-2">
          Accès au microphone refusé. Vérifiez les permissions de votre navigateur.
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`rounded-full w-12 h-12 ${
          status === "recording" ? "bg-red-50 text-red-500 border-red-500" : ""
        }`}
        onClick={status === "recording" ? stopRecording : handleStartRecording}
        disabled={isTranscribing || permissionDenied || !isSecureContext}
      >
        {status === "recording" ? (
          <Square className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      <span className="text-xs text-gray-500">
        {status === "recording" ? "Stop" : "Enregistrer"}
      </span>
    </div>
  );
};

export default AudioRecorder;
