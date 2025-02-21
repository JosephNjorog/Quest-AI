import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const CommandInput = () => {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsProcessing(true);
    // TODO: Implement actual command processing
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const presetCommands = [
    "Farm magic carrots for 24 hours",
    "Balance resource gathering with PVP",
    "Use 50% budget for seeds farming"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Command Your AI Agent</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter your command..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Quick Commands:</p>
          <div className="flex flex-wrap gap-2">
            {presetCommands.map((preset, index) => (
              <button
                key={index}
                onClick={() => setCommand(preset)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandInput;