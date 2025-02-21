import React from 'react';
import { Card } from '../common/Card';
import { Brain, MessageSquare } from 'lucide-react';

const AgentResponse = ({ response }) => {
  const defaultResponse = {
    thought: "Analyzing the current market conditions and hero stats to optimize farming strategy",
    action: "Will deploy heroes to Garden 7 for magic carrot farming due to higher yield rates",
    reasoning: [
      "Current market price for magic carrots is above average",
      "Heroes have sufficient stamina for extended farming",
      "Garden 7 has the best yield/stamina ratio",
      "Weather conditions are optimal for farming"
    ],
    nextSteps: [
      "Monitor market prices for potential sell opportunities",
      "Rotate heroes to maintain optimal stamina levels",
      "Adjust strategy if market conditions change"
    ]
  };

  const currentResponse = response || defaultResponse;

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-6 h-6 text-purple-500" />
        <h2 className="text-lg font-semibold">AI Agent Response</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Thought Process</h3>
          <p className="text-gray-800">{currentResponse.thought}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Planned Action</h3>
          <p className="text-gray-800">{currentResponse.action}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Reasoning</h3>
          <ul className="list-disc pl-5 space-y-1">
            {currentResponse.reasoning.map((reason, index) => (
              <li key={index} className="text-gray-800">{reason}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Next Steps</h3>
          <ul className="list-disc pl-5 space-y-1">
            {currentResponse.nextSteps.map((step, index) => (
              <li key={index} className="text-gray-800">{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-between">
        <button className="flex items-center text-blue-600 hover:text-blue-700">
          <MessageSquare className="w-4 h-4 mr-2" />
          Provide Feedback
        </button>
        <span className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>
    </Card>
  );
};

export default AgentResponse;