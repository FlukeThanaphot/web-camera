import React, { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'

enum DeviceKind {
  AudioInput = 'audioinput',
  Video = 'videoinput',
  AudioOutput = 'audiooutput'
}

const WebCamera = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isAllowPermission, setIsAllowPermission] = useState<boolean>(false);
  const checkPermissionCount = useRef<number>(0);

  const getPermissionDevice = async () => {
    checkPermissionCount.current = checkPermissionCount.current + 1
    try {
      const option: MediaStreamConstraints = {
        video: true
      }
      const device = await navigator.mediaDevices.getUserMedia(option)
      return true
    }
    catch (err) {
      showPermissionInstructions()
    }
  }

  const showPermissionInstructions = () => {
    alert("Please enable camera permissions in your browser settings and then click 'Try Again'.");
  };

  const getDevice = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
  }

  const getVideoDevices = async () => {
    const devices = await getDevice();
    const videoDevices = devices.filter((device) => device.kind === DeviceKind.Video)
    setDevices([...videoDevices])
    return videoDevices
  }

  const onClickGetDevice = async () => {
    const videoDevices = await getVideoDevices()
    console.log(videoDevices)
  }

  const onClickCapture = async () => {
    const webcam = webcamRef.current
    if (!webcam) return;

    const isAllowPermissionVideoDevice = await getPermissionDevice()
    if (!isAllowPermissionVideoDevice) return;

    const imgSrcBase64 = webcam.getScreenshot();
    if (!imgSrcBase64) return;

    const file = convertBase64ToFile(imgSrcBase64, 'test')
    saveFile(file)

  }

  const convertBase64ToFile = (base64String: string, filename: string) => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches?.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    const binaryString = atob(base64Data);

    // Convert the binary string to a Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the Uint8Array
    const blob = new Blob([bytes], { type: contentType });

    // Create a File object from the Blob
    const file = new File([blob], filename, { type: contentType });

    return file;
  }

  const saveFile = (file: File) => {
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = file.name;

    // Trigger a click event on the link
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
  }

  useEffect(() => {
    if (checkPermissionCount.current === 0) getPermissionDevice();
  }, [checkPermissionCount.current])

  console.log()

  return (
    <>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />

      <div style={{ marginTop: '28px' }}>
        <h3>Device List</h3>
        {
          devices.map((device, index) => (
            <div key={device.deviceId} style={{ fontSize: '12px', padding: '8px' }}>
              <h4>Device {index + 1}</h4>
              <p>deviceId ({index + 1}): {device.deviceId}</p>
              <p>groupId ({index + 1}): {device.groupId}</p>
              <p>kind ({index + 1}): {device.kind}</p>
              <p>label ({index + 1}): {device.label}</p>
            </div>
          ))
        }
      </div>

      <div style={{ marginTop: '28px', gap: '8px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={onClickGetDevice}>Get Devices</button>
        <button onClick={onClickCapture}>Capture photo</button>
      </div>
    </>
  )
}

export default WebCamera
