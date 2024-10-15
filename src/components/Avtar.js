import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AvatarModel from './model';

function AvatarViewer() {
  const [inputValue, setInputValue] = useState('');
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const audioRef = useRef(new Audio());

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await processInput(inputValue);
    setInputValue('');
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (text.toLowerCase() !== 'clap') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        // Start animation on speech start
        utterance.onstart = () => {
          setCurrentAnimation('talk');
          audioRef.current = new Audio(); // Reset the audio reference
          audioRef.current.src = ''; // Set the source if needed
        };

        // Reset animation on speech end
        utterance.onend = () => {
          setCurrentAnimation('idle');
        };

        // Speak the utterance
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Your browser does not support text-to-speech.');
    }
  };

  const processInput = async (input) => {
    if (input.toLowerCase() === 'clap') {
      setCurrentAnimation('clap');
    } else if (input.toLowerCase() !== 'idle' && input.toLowerCase() !== 'clap') {
      setCurrentAnimation('talk');
      if(input.toLowerCase() === 'hii'){
        let hiResponse = "Hello I am Dex nice to meet you how can i help you"
        speakText(hiResponse); 
      }
    else if(input.toLowerCase() === 'bye'){
      setCurrentAnimation('bye');
    }
      else{
        speakText(input);
      }
    } else {
      setCurrentAnimation('idle');
    }
  };

  return (
    <>
      <h1>
        <img src="https://cdn-icons-png.flaticon.com/128/3558/3558977.png" width="2.7%" alt="logo" /> Dex AI
      </h1>
      <Canvas style={{ height: '150vh', width: '100%' }} camera={{ position: [0, 9, 5], fov: 80 }}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AvatarModel currentAnimation={currentAnimation} audioRef={audioRef} />
        <OrbitControls target={[0, 9, 0]} />
      </Canvas>
      <div className="form">
        <form onSubmit={handleSubmit} className="form_components">
          <input 
            type="text" 
            className="chatIn" 
            placeholder="User Input"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button type="submit">
            <i className="fi fi-rr-microphone"></i> Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default AvatarViewer;
