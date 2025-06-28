import faceapi from "face-api.js";


async function registerFace(name) {
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
  
    if (!detections) {
      alert("No face detected.");
      return;
    }
  
    const response = await fetch("http://localhost:5000/api/register-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, descriptor: detections.descriptor }),
    });
  
    const result = await response.json();
    alert(result.message);
  }
  