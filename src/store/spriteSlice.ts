import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Sprite {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: number;
  scripts: Script[];
  originalScripts?: Script[];
}

export interface Script {
  id: string;
  type: 'motion' | 'looks' | 'control';
  action: string;
  params: Record<string, any>;
}

interface SpriteState {
  sprites: Sprite[];
  activeSprite: string | null;
  collisions: Record<string, boolean>;
  sharedScripts: Script[];
}

const initialState: SpriteState = {
  sprites: [
    {
      id: 'sprite1',
      name: 'Sprite 1',
      x: 100,
      y: 100,
      direction: 90,
      scripts: []
    }
  ],
  activeSprite: 'sprite1',
  collisions: {},
  sharedScripts: []
};

const spriteSlice = createSlice({
  name: 'sprites',
  initialState,
  reducers: {
    addSprite: (state) => {
      const newId = `sprite${state.sprites.length + 1}`;
      state.sprites.push({
        id: newId,
        name: `Sprite ${state.sprites.length + 1}`,
        x: Math.random() * 200,
        y: Math.random() * 200,
        direction: 90,
        scripts: [...state.sharedScripts] // New sprites get all shared scripts
      });
    },
    setActiveSprite: (state, action: PayloadAction<string>) => {
      state.activeSprite = action.payload;
    },
    addScript: (state, action: PayloadAction<{ spriteId: string; script: Script }>) => {
      const script = action.payload.script;
      // Add to shared scripts if it doesn't exist
      if (!state.sharedScripts.some(s => s.id === script.id)) {
        state.sharedScripts.push(script);
        // Add to all sprites
        state.sprites.forEach(sprite => {
          if (!sprite.scripts.some(s => s.id === script.id)) {
            sprite.scripts.push(script);
          }
        });
      }
    },
    removeScript: (state, action: PayloadAction<{ spriteId: string; scriptId: string }>) => {
      // Remove from shared scripts
      state.sharedScripts = state.sharedScripts.filter(
        script => script.id !== action.payload.scriptId
      );
      // Remove from all sprites
      state.sprites.forEach(sprite => {
        sprite.scripts = sprite.scripts.filter(
          script => script.id !== action.payload.scriptId
        );
      });
    },
    updateSpritePosition: (state, action: PayloadAction<{ spriteId: string; x: number; y: number }>) => {
      const sprite = state.sprites.find(s => s.id === action.payload.spriteId);
      if (sprite) {
        sprite.x = action.payload.x;
        sprite.y = action.payload.y;
        
        // Check collisions with other sprites
        state.sprites.forEach(otherSprite => {
          if (otherSprite.id !== sprite.id) {
            const dx = sprite.x - otherSprite.x;
            const dy = sprite.y - otherSprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const collisionKey = [sprite.id, otherSprite.id].sort().join('-');
            const wasColliding = state.collisions[collisionKey];
            const isColliding = distance < 50; // Collision threshold
            
            if (isColliding && !wasColliding) {
              // Store original scripts before swapping
              const tempScripts = [...sprite.scripts];
              sprite.originalScripts = tempScripts;
              otherSprite.originalScripts = [...otherSprite.scripts];
              
              // Swap scripts
              sprite.scripts = [...otherSprite.scripts];
              otherSprite.scripts = tempScripts;
              
              // Reverse movement directions in move scripts
              sprite.scripts = sprite.scripts.map(script => {
                if (script.action === 'move') {
                  return {
                    ...script,
                    params: { ...script.params, steps: -script.params.steps }
                  };
                }
                return script;
              });
              
              otherSprite.scripts = otherSprite.scripts.map(script => {
                if (script.action === 'move') {
                  return {
                    ...script,
                    params: { ...script.params, steps: -script.params.steps }
                  };
                }
                return script;
              });
            } else if (!isColliding && wasColliding) {
              // Restore original scripts when sprites separate
              if (sprite.originalScripts) {
                sprite.scripts = [...sprite.originalScripts];
                delete sprite.originalScripts;
              }
              if (otherSprite.originalScripts) {
                otherSprite.scripts = [...otherSprite.originalScripts];
                delete otherSprite.originalScripts;
              }
            }
            
            state.collisions[collisionKey] = isColliding;
          }
        });
      }
    }
  }
});

export const {
  addSprite,
  setActiveSprite,
  addScript,
  removeScript,
  updateSpritePosition
} = spriteSlice.actions;

export default spriteSlice.reducer;