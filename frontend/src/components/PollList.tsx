interface Poll {
  id: string;
  question: string;
  options: string[];
  counts: number[];
  isActive: boolean;
  creator: string;
}

interface PollListProps {
  polls: Poll[];
  onOpen: (id: string) => void;
  isLoading: boolean;
}

export default function PollList({ polls, onOpen, isLoading }: PollListProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Available Polls</h2>
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          Loading polls...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Available Polls</h2>
      
      {polls.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          No polls found. Create one to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div 
              key={poll.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{poll.question}</h3>
                  
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {poll.counts.reduce((a, b) => a + b, 0)} votes
                    
                    <span className="ml-2 px-2 py-1 rounded text-xs">
                      {poll.isActive ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Ended</span>
                      )}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onOpen(poll.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  View Poll
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}