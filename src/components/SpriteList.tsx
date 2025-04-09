import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSprite, setActiveSprite } from '../store/spriteSlice';
import type { RootState } from '../store/store';

export default function SpriteList() {
  const dispatch = useDispatch();
  const { sprites, activeSprite } = useSelector((state: RootState) => state.sprites);

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Sprites</h2>
        <button
          onClick={() => dispatch(addSprite())}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Sprite
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sprites.map((sprite) => (
          <div
            key={sprite.id}
            onClick={() => dispatch(setActiveSprite(sprite.id))}
            className={`p-2 border rounded cursor-pointer ${
              activeSprite === sprite.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {sprite.name}
          </div>
        ))}
      </div>
    </div>
  );
}