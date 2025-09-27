import * as React from "react";
const { useState } = React;

interface CreatePollProps {
  onCreate: (question: string, options: string[]) => Promise<void>;
  isCreating: boolean;
}

export default function CreatePoll({ onCreate, isCreating }: CreatePollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    if (options.length >= 5) {
      setError("Maximum 5 options allowed");
      return;
    }
    setOptions([...options, ""]);
    setError(null);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError("Minimum 2 options required");
      return;
    }
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("At least 2 valid options are required");
      return;
    }
    
    try {
      await onCreate(question, validOptions);
      // Reset form on success
      setQuestion("");
      setOptions(["", ""]);
    } catch (err) {
      console.error("Failed to create poll:", err);
      setError(err instanceof Error ? err.message : "Failed to create poll");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Poll</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium mb-1">
            Question
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            disabled={isCreating}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Options (2-5)
          </label>
          
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                disabled={isCreating}
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
                disabled={options.length <= 2 || isCreating}
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addOption}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            disabled={options.length >= 5 || isCreating}
          >
            + Add Option
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}