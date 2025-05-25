import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export const MyWebcam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc);
  };

  const videoConstraints = { facingMode };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        key={facingMode}
      />
      {isMobile && (
        <button onClick={toggleFacingMode}>
          Switch to {facingMode === "user" ? "Back" : "Front"} Camera
        </button>
      )}
      <button onClick={capture}>Capture</button>
    </div>
  );
};
