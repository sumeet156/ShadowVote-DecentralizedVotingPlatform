import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConnectWallet from './components/ConnectWallet';
import CreatePoll from './components/CreatePoll';
import PollList from './components/PollList';
import PollPage from './components/PollPage';
import NotConnectedMessage from './components/NotConnectedMessage';
import { ShadowVoteService } from './services/ShadowVoteService';
import type { Poll } from './services/ShadowVoteService';
import './App.css';

function App() {
  // Wallet connection state
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [service, setService] = useState<ShadowVoteService | null>(null);
  
  // Application state
  const [view, setView] = useState<'list' | 'create' | 'poll'>('list');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Initialize and load polls when provider changes
  useEffect(() => {
    if (provider) {
      try {
        const shadowVoteService = new ShadowVoteService(provider);
        setService(shadowVoteService);
        
        // Load all polls
        loadPolls(shadowVoteService);
      } catch (err) {
        console.error("Failed to initialize service:", err);
        setError("Failed to connect to the blockchain. Please check your connection and try again.");
        setIsLoading(false);
      }
    }
  }, [provider]);

  // Load poll details when a poll is selected
  useEffect(() => {
    if (service && selectedPollId) {
      loadPollDetails(selectedPollId);
    }
  }, [service, selectedPollId]);

  const handleConnect = (address: string, providerInstance: ethers.BrowserProvider) => {
    setAccount(address);
    setProvider(providerInstance);
  };

  const loadPolls = async (serviceInstance: ShadowVoteService) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allPolls = await serviceInstance.getAllPolls();
      setPolls(allPolls);
    } catch (err) {
      console.error("Failed to load polls:", err);
      setError("Failed to load polls. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPollDetails = async (pollId: string) => {
    if (!service) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const poll = await service.getPoll(pollId);
      setSelectedPoll(poll);
      setView('poll');
    } catch (err) {
      console.error("Failed to load poll details:", err);
      setError("Failed to load poll details. The poll may not exist.");
      setView('list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    if (!service || !account) return;
    
    setIsCreatingPoll(true);
    setError(null);
    
    try {
      await service.createPoll(question, options);
      // Reload polls after creating a new one
      await loadPolls(service);
      setView('list');
    } catch (err) {
      console.error("Failed to create poll:", err);
      setError("Failed to create poll. Please try again.");
    } finally {
      setIsCreatingPoll(false);
    }
  };

  const handleVote = async (pollId: string, choice: number) => {
    if (!service || !account) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      await service.vote(pollId, choice);
      // Reload poll details after voting
      await loadPollDetails(pollId);
    } catch (err) {
      console.error("Failed to cast vote:", err);
      setError("Failed to cast vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleOpenPoll = (pollId: string) => {
    setSelectedPollId(pollId);
  };

  const handleNavigate = (newView: 'list' | 'create' | 'poll') => {
    setView(newView);
    if (newView === 'list' && service) {
      loadPolls(service);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ShadowVote 🗳️
            </h1>
            
            <div className="flex items-center gap-4">
              {account ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 py-1 px-3 rounded-full">
                    {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                  </div>
                </div>
              ) : (
                <ConnectWallet onConnect={handleConnect} />
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => handleNavigate('list')}
            className={`px-4 py-2 rounded ${
              view === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            All Polls
          </button>
          
          {account && (
            <button
              onClick={() => handleNavigate('create')}
              className={`px-4 py-2 rounded ${
                view === 'create' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              Create Poll
            </button>
          )}
        </div>
        
        {/* Main content */}
        <div className="max-w-3xl mx-auto">
          {!account && view !== 'poll' && (
            <NotConnectedMessage />
          )}
          
          {view === 'list' && (
            <PollList 
              polls={polls} 
              onOpen={handleOpenPoll}
              isLoading={isLoading} 
            />
          )}
          
          {view === 'create' && account && (
            <CreatePoll 
              onCreate={handleCreatePoll}
              isCreating={isCreatingPoll} 
            />
          )}
          
          {view === 'poll' && (
            <PollPage
              poll={selectedPoll}
              isLoading={isLoading}
              onVote={handleVote}
              isVoting={isVoting}
              error={error}
              currentAccount={account || undefined}
            />
          )}
        </div>
      </main>
      
      <footer className="mt-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>ShadowVote — Secure and Anonymous Voting on the Blockchain</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
