interface Poll {
  id: string;
  question: string;
  options: string[];
  counts: number[];
  isActive: boolean;
  creator: string;
}

interface PollPageProps {
  poll: Poll | null;
  isLoading: boolean;
  onVote: (pollId: string, choice: number) => Promise<void>;
  isVoting: boolean;
  error: string | null;
  currentAccount?: string;
}

export default function PollPage({
  poll,
  isLoading,
  onVote,
  isVoting,
  error,
  currentAccount
}: PollPageProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Loading Poll...</h2>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Poll Not Found</h2>
        <p>The requested poll could not be found.</p>
      </div>
    );
  }

  const totalVotes = poll.counts.reduce((a, b) => a + b, 0);
  const isCreator = currentAccount && currentAccount.toLowerCase() === poll.creator.toLowerCase();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">{poll.question}</h2>
          <div className={`px-2 py-1 rounded text-xs ${poll.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {poll.isActive ? 'Active' : 'Ended'}
          </div>
        </div>
        
        {isCreator && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Created by you
          </div>
        )}
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Total Votes: {totalVotes}
        </div>
      </div>

      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const voteCount = poll.counts[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          
          return (
            <div key={index} className="mb-4">
              <div className="flex justify-between mb-1">
                <span>{option}</span>
                <span>{voteCount} votes ({percentage}%)</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              {poll.isActive && currentAccount && (
                <button
                  onClick={() => onVote(poll.id, index)}
                  disabled={isVoting}
                  className="mt-2 bg-transparent hover:bg-blue-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 py-1 px-3 border border-blue-600 dark:border-blue-400 rounded text-sm transition-colors disabled:opacity-50"
                >
                  {isVoting ? "Voting..." : "Vote"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {error && (
        <div className="mt-4 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {!currentAccount && (
        <div className="mt-4 text-amber-500 text-sm">
          Connect your wallet to vote on this poll.
        </div>
      )}
      
      {!poll.isActive && (
        <div className="mt-4 text-gray-500 text-sm">
          This poll has ended and is no longer accepting votes.
        </div>
      )}
    </div>
  );
}