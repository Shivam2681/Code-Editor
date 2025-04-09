import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addScript, updateSpritePosition } from '../store/spriteSlice';

export default function MidArea() {
  const activeSprite = useSelector((state: RootState) => 
    state.sprites.sprites.find(s => s.id === state.sprites.activeSprite)
  );

  const dispatch = useDispatch();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockData = JSON.parse(e.dataTransfer.getData('block'));
    
    if (activeSprite) {
      let script;
      
      switch (blockData.id) {
        case 'say':
        case 'think':
          script = {
            id: `script-${Date.now()}`,
            type: 'looks',
            action: blockData.id,
            params: {
              message: prompt('Enter message:', '') || '',
              duration: parseInt(prompt('Enter duration (seconds):', '2') || '2')
            }
          };
          break;
          
        case 'goto':
          script = {
            id: `script-${Date.now()}`,
            type: 'motion',
            action: blockData.id,
            params: {
              x: parseInt(prompt('Enter X coordinate:', '0') || '0'),
              y: parseInt(prompt('Enter Y coordinate:', '0') || '0')
            }
          };
          break;
          
        case 'repeat':
          script = {
            id: `script-${Date.now()}`,
            type: 'control',
            action: blockData.id,
            params: {
              count: parseInt(prompt('Enter repeat count:', '10') || '10'),
              scripts: []
            }
          };
          break;
          
        default:
          script = {
            id: `script-${Date.now()}`,
            type: blockData.type || 'motion',
            action: blockData.id,
            params: blockData.params || { [blockData.param]: blockData.defaultValue }
          };
      }

      dispatch(addScript({
        spriteId: activeSprite.id,
        script
      }));
    }
  };

  const handleScriptClick = (script: any) => {
    if (!activeSprite) return;

    const executeSlowMovement = async () => {
      const spriteElement = document.querySelector(`#sprite-${activeSprite.id}`) as HTMLElement;
      if (!spriteElement) return;

      const currentX = parseFloat(spriteElement.style.left || '0');
      const currentY = parseFloat(spriteElement.style.top || '0');
      let rotation = parseFloat(spriteElement.style.transform?.replace('rotate(', '').replace('deg)', '') || '0');

      switch (script.action) {
        case 'move':
          const angle = (rotation * Math.PI) / 180;
          const newX = currentX + Math.cos(angle);
          const newY = currentY + Math.sin(angle);
          
          // Check boundaries (assuming preview area is 500x500)
          const boundedX = Math.max(0, Math.min(newX, 450));
          const boundedY = Math.max(0, Math.min(newY, 450));
          
          dispatch(updateSpritePosition({ 
            spriteId: activeSprite.id, 
            x: boundedX, 
            y: boundedY 
          }));
          break;

        case 'turn-left':
          rotation -= 5;
          spriteElement.style.transform = `rotate(${rotation}deg)`;
          break;

        case 'turn-right':
          rotation += 5;
          spriteElement.style.transform = `rotate(${rotation}deg)`;
          break;
      }
    };

    if (script.type === 'motion') {
      executeSlowMovement();
    }
  };

  const handleDragStart = (e: React.DragEvent, script: any) => {
    e.dataTransfer.setData('scriptToRemove', JSON.stringify({
      spriteId: activeSprite?.id,
      scriptId: script.id
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="flex-1 h-full overflow-auto p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >

      {/* main div */}
      <div className="font-bold mb-4">Scripts for {activeSprite?.name}</div>
      <div className="space-y-2">
        {activeSprite?.scripts.map((script) => (
          <div 
            key={script.id}
            className={`p-2 rounded cursor-pointer ${
              script.type === 'motion' ? 'bg-blue-500 hover:bg-blue-600' :
              script.type === 'looks' ? 'bg-purple-500 hover:bg-purple-600' :
              'bg-yellow-500 hover:bg-yellow-600'
            } text-white`}
            draggable
            onDragStart={(e) => handleDragStart(e, script)}
            onClick={() => handleScriptClick(script)}
          >
            {script.action}: {JSON.stringify(script.params)}
          </div>
        ))}
      </div>
    </div>
  );
}