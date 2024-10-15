import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useFBX } from '@react-three/drei';
import { AnimationMixer } from 'three';
import { useFrame } from '@react-three/fiber';

function AvatarModel({ currentAnimation, audioRef }) {
  const { scene } = useGLTF('./model/670bc135797f7529d9f56dad.glb'); // Update to your model path
  const idleAnimation = useFBX('./animations/Breathing Idle.fbx');
  const clapAnimation = useFBX('./animations/Clapping.fbx');
  const talkAnimation = useFBX('./animations/Talking.fbx');
  const waveAnimation = useFBX('./animations/Waving.fbx');

  const mixer = useRef(new AnimationMixer(scene));
  const idleAction = useRef(null);
  const clapAction = useRef(null);
  const talkAction = useRef(null);
  const waveAction = useRef(null);
  const [mouthOpen, setMouthOpen] = useState(0);

  // Load animations and set up the mixer
  useEffect(() => {
    if (scene && idleAnimation && clapAnimation && talkAnimation && waveAnimation) {
      idleAction.current = mixer.current.clipAction(idleAnimation.animations[0]);
      clapAction.current = mixer.current.clipAction(clapAnimation.animations[0]);
      talkAction.current = mixer.current.clipAction(talkAnimation.animations[0]);
      waveAction.current = mixer.current.clipAction(waveAnimation.animations[0]);

      idleAction.current.play(); // Start with idle animation
    }

    return () => mixer.current.stopAllAction();
  }, [scene, idleAnimation, clapAnimation, talkAnimation, waveAnimation]);

  // Manage animation states based on currentAnimation
  useEffect(() => {
    if (mixer.current) {
      mixer.current.stopAllAction(); // Stop all actions before switching

      if (currentAnimation === 'clap') {
        clapAction.current.reset().play();
        const timeoutId = setTimeout(() => {
          mixer.current.stopAllAction();
          idleAction.current.reset().play();
        }, 2000); 
        return () => clearTimeout(timeoutId);
      } else if (currentAnimation === 'talk') {
        talkAction.current.reset().play();
      }
      else if (currentAnimation === 'bye') {
        waveAction.current.reset().play();
        const timeoutId = setTimeout(() => {
          mixer.current.stopAllAction();
          idleAction.current.reset().play();
        }, 2000); 
        return () => clearTimeout(timeoutId);} 
      else {
        idleAction.current.reset().play();
      }
    }
  }, [currentAnimation]);

  // Lip-sync effect based on audio frequency
  useEffect(() => {
    if (currentAnimation === 'talk' && audioRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const source = audioContext.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMouth = () => {
        analyser.getByteFrequencyData(dataArray);
        const avgFrequency = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // Debug: log avg frequency
        console.log('Avg Frequency:', avgFrequency);

        const mouthValue = Math.min(avgFrequency / 255, 1); // Scale between 0 and 1
        setMouthOpen(mouthValue); // Update mouthOpen state
        requestAnimationFrame(updateMouth); // Request next frame update
      };

      updateMouth(); // Start updating mouth sync

      return () => {
        audioContext.close(); // Clean up audio context
      };
    }
  }, [audioRef, currentAnimation]);

  // Update the mixer on each frame
  useFrame((state, delta) => {
    mixer.current.update(delta);

    // Apply mouth movement based on mouthOpen state
    if (scene && scene.morphTargetInfluences) {
      // Adjust the index based on your GLTF model's morph target
      // Check the number of morph targets and adjust the index accordingly
      console.log('Morph Target Influences:', scene.morphTargetInfluences); // Debugging line
      scene.morphTargetInfluences[1] = mouthOpen; // Replace with the correct index if needed
    }
  });

  return <primitive object={scene} scale={5.5} />; // Adjust scale as needed
}

useGLTF.preload('./model/670bc135797f7529d9f56dad.glb'); // Preload your model

export default AvatarModel;