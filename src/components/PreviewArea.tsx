import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateSpritePosition } from '../store/spriteSlice';
import CatSprite from "./CatSprite";

export default function PreviewArea() {
  const sprites = useSelector((state: RootState) => state.sprites.sprites);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const dispatch = useDispatch();

  const executeScript = async (sprite: any, script: any) => {
    const spriteElement = containerRef.current?.querySelector(`#sprite-${sprite.id}`) as HTMLElement;
    if (!spriteElement) return;

    const currentX = parseFloat(spriteElement.style.left || '0');
    const currentY = parseFloat(spriteElement.style.top || '0');
    let rotation = parseFloat(spriteElement.style.transform?.replace('rotate(', '').replace('deg)', '') || '0');

    switch (script.action) {
      case 'move':
        const steps = script.params.steps as number;
        const angle = (rotation * Math.PI) / 180;
        const newX = currentX + steps * Math.cos(angle);
        const newY = currentY + steps * Math.sin(angle);
        
        // Check boundaries (assuming preview area is 500x500)
        const boundedX = Math.max(0, Math.min(newX, 450));
        const boundedY = Math.max(0, Math.min(newY, 450));
        
        dispatch(updateSpritePosition({ 
          spriteId: sprite.id, 
          x: boundedX, 
          y: boundedY 
        }));
        break;

      case 'turn-left':
        rotation -= script.params.degrees as number;
        spriteElement.style.transform = `rotate(${rotation}deg)`;
        break;

      case 'turn-right':
        rotation += script.params.degrees as number;
        spriteElement.style.transform = `rotate(${rotation}deg)`;
        break;

      case 'goto':
        const { x, y } = script.params;
        const boundedGotoX = Math.max(0, Math.min(Number(x), 450));
        const boundedGotoY = Math.max(0, Math.min(Number(y), 450));
        dispatch(updateSpritePosition({ 
          spriteId: sprite.id, 
          x: boundedGotoX, 
          y: boundedGotoY 
        }));
        break;

      case 'say':
        const speechBubble = document.createElement('div');
        speechBubble.className = 'absolute bg-white p-2 rounded-lg border border-gray-300 -top-10 left-full ml-2';
        speechBubble.textContent = script.params.message as string;
        spriteElement.appendChild(speechBubble);
        await new Promise(resolve => setTimeout(resolve, (script.params.duration as number) * 1000));
        speechBubble.remove();
        break;

      case 'think':
        const thoughtBubble = document.createElement('div');
        thoughtBubble.className = 'absolute bg-white p-2 rounded-full border border-gray-300 -top-10 left-full ml-2';
        thoughtBubble.textContent = '💭 ' + (script.params.message as string);
        spriteElement.appendChild(thoughtBubble);
        await new Promise(resolve => setTimeout(resolve, (script.params.duration as number) * 1000));
        thoughtBubble.remove();
        break;
    }
  };

  const handlePlay = async () => {
    if (animationRef.current) return;
    
    const runScripts = async () => {
      for (const sprite of sprites) {
        for (const script of sprite.scripts) {
          if (script.type === 'control' && script.action === 'repeat') {
            const repeatCount = script.params.count as number;
            for (let i = 0; i < repeatCount; i++) {
              for (const nestedScript of script.params.scripts as any[]) {
                await executeScript(sprite, nestedScript);
              }
            }
          } else {
            await executeScript(sprite, script);
          }
        }
      }
    };

    // Start continuous animation loop
    const animate = () => {
      runScripts();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const handleStop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-2 relative" ref={containerRef}>
      <div className="flex gap-2 mb-4">
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={handlePlay}
        >
          Play
        </button>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={handleStop}
        >
          Stop
        </button>
      </div>
      
      <div className="relative w-full h-[500px] border-2 border-gray-200 rounded">
        {sprites.map(sprite => (
          <div 
            key={sprite.id}
            id={`sprite-${sprite.id}`}
            className="absolute"
            style={{
              left: sprite.x,
              top: sprite.y,
              transform: `rotate(${sprite.direction}deg)`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <CatSprite />
          </div>
        ))}
      </div>
    </div>
  );
}