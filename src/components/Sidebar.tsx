import React from "react";
import { useDispatch } from 'react-redux';
import { removeScript } from '../store/spriteSlice';
import Icon from "./Icon";

const motionBlocks = [
  { id: 'move', text: 'Move', type: 'motion', param: 'steps', defaultValue: 10 },
  { id: 'turn-left', text: 'Turn Left', type: 'motion', icon: 'undo', param: 'degrees', defaultValue: 15 },
  { id: 'turn-right', text: 'Turn Right', type: 'motion', icon: 'redo', param: 'degrees', defaultValue: 15 },
  { id: 'goto', text: 'Go to', type: 'motion', params: { x: 0, y: 0 } }
];

const looksBlocks = [
  { id: 'say', text: 'Say', type: 'looks', params: { message: '', duration: 2 } },
  { id: 'think', text: 'Think', type: 'looks', params: { message: '', duration: 2 } }
];

const controlBlocks = [
  { 
    id: 'repeat', 
    text: 'Repeat', 
    type: 'control',
    params: { 
      count: 10,
      scripts: []
    } 
  }
];

export default function Sidebar() {
  const dispatch = useDispatch();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('scriptToRemove'));
    if (data.spriteId && data.scriptId) {
      dispatch(removeScript(data));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderBlock = (block: any) => (
    <div 
      key={block.id}
      className={`flex flex-row flex-wrap ${
        block.type === 'motion' ? 'bg-blue-500' :
        block.type === 'looks' ? 'bg-purple-500' :
        'bg-yellow-500'
      } text-white px-2 py-1 my-2 text-sm cursor-move rounded`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('block', JSON.stringify(block));
      }}
    >
      {block.text}{' '}
      {block.icon && <Icon name={block.icon} size={15} className="text-white mx-2" />}
      {block.param && `${block.defaultValue} ${block.param}`}
    </div>
  );

  return (
    <div 
      className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="font-bold mb-2">Motion</div>
      {motionBlocks.map(renderBlock)}
      
      <div className="font-bold mt-4 mb-2">Looks</div>
      {looksBlocks.map(renderBlock)}
      
      <div className="font-bold mt-4 mb-2">Control</div>
      {controlBlocks.map(renderBlock)}
    </div>
  );
}