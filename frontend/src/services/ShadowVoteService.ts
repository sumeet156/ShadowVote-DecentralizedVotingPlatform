import { ethers } from "ethers";

// Define the contract interface with the methods we need
// Define transaction and log types for our contract
type ContractTransaction = {
  hash: string;
  wait?: () => Promise<any>;
};

type ContractReceipt = {
  logs: Array<any>;
};

// Define the contract interface with the methods we need
interface ShadowVoteContract {
  connect(signer: ethers.Signer): ShadowVoteContract;
  createPoll(question: string, options: string[]): Promise<ContractTransaction>;
  vote(pollId: string, choice: number): Promise<ContractTransaction>;
  getPolls(): Promise<any[]>;
  getPoll(pollId: string): Promise<any>;
  interface: {
    parseLog(log: any): {
      name: string;
      args: { [key: string]: any } & Array<any>;
    } | null;
  };
}

// ShadowVote contract ABI - this is a simplified ABI that needs to be replaced
// with the actual ABI from your compiled contract
const contractABI = [
  // Events
  "event PollCreated(uint64 indexed pollId, address indexed creator, string question)",
  "event VoteCast(uint64 indexed pollId, address indexed voter)",
  
  // Functions
  "function createPoll(string calldata question, string[] calldata options) external returns (uint64)",
  "function vote(uint64 pollId, uint32 choice) external",
  "function getPolls() external view returns (tuple(uint64 id, string question, string[] options, uint64[] counts, address creator, bool isActive)[])",
  "function getPoll(uint64 pollId) external view returns (tuple(uint64 id, string question, string[] options, uint64[] counts, address creator, bool isActive))",
] as const;

// This should be the actual contract address from your deployment
// For development, we'll use mock functionality as we don't have a real contract yet
const CONTRACT_ADDRESS: string = ""; // Set this when you deploy your contract

// Sample mock data for testing
const mockPolls = [
  {
    id: "1",
    question: "What is your favorite programming language?",
    options: ["JavaScript", "Python", "Rust", "Solidity"],
    counts: [12, 8, 5, 20],
    creator: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    isActive: true,
  },
  {
    id: "2",
    question: "Which blockchain do you prefer?",
    options: ["Ethereum", "Solana", "Polkadot", "Cardano"],
    counts: [25, 14, 9, 7],
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    isActive: true,
  },
  {
    id: "3",
    question: "Best crypto wallet?",
    options: ["MetaMask", "WalletConnect", "Coinbase Wallet", "Trust Wallet"],
    counts: [18, 11, 9, 12],
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    isActive: false,
  }
];

export interface Poll {
  id: string;
  question: string;
  options: string[];
  counts: number[];
  creator: string;
  isActive: boolean;
}

export class ShadowVoteService {
  private provider: ethers.BrowserProvider;
  private userAddress: string;
  private mockPolls: Poll[];
  private isContractAvailable: boolean = false;
  private contract: ShadowVoteContract | null = null;
  
  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider;
    this.mockPolls = [...mockPolls]; // Clone the mock polls
    this.userAddress = "";

    // Try to initialize the contract if available
    try {
      // For development: Only try to use the contract if an address is specified
      if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.length > 0 && CONTRACT_ADDRESS.startsWith('0x')) {
        // Create an instance of the contract
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS, 
          contractABI, 
          provider
        );
        
        // Cast to our interface type
        this.contract = contractInstance as unknown as ShadowVoteContract;
        this.isContractAvailable = true;
      } else {
        console.log("No contract address specified, using mock data");
        this.isContractAvailable = false;
      }
    } catch (error) {
      console.warn("Contract not available, using mock data instead:", error);
      this.isContractAvailable = false;
    }

    // Get the user address
    this.provider.getSigner().then(signer => {
      signer.getAddress().then(address => {
        this.userAddress = address;
      });
    }).catch(err => {
      console.error("Failed to get signer address:", err);
      // Generate a mock address for testing
      this.userAddress = "0xMockUser" + Math.floor(Math.random() * 1000000).toString(16);
    });
  }
  
  async createPoll(question: string, options: string[]): Promise<string> {
    try {
      if (this.isContractAvailable && this.contract) {
        const signer = await this.provider.getSigner();
        // Use proper typing for the contract with signer
        const contractWithSigner = this.contract.connect(signer) as unknown as ShadowVoteContract;
        
        const tx = await contractWithSigner.createPoll(question, options);
        
        // Wait for transaction confirmation
        let receipt;
        if (typeof tx.wait === 'function') {
          receipt = await tx.wait();
        } else {
          // If wait is not available, we'll just use tx as the receipt
          receipt = { logs: [] };
          console.warn("Transaction wait method not available");
        }
        
            // Extract the poll ID from the event if logs are available
        let pollId = "0";
        if (receipt.logs && receipt.logs.length > 0) {
          try {
            for (const log of receipt.logs) {
              try {
                // Try to parse the log
                const parsedLog = this.contract!.interface.parseLog(log);
                
                // Check if this is our event
                if (parsedLog && parsedLog.name === "PollCreated") {
                  // In ethers v6, args might be an array-like object with both numeric and named properties
                  pollId = parsedLog.args.pollId?.toString() || 
                          (parsedLog.args[0]?.toString()) || 
                          "0";
                  break;
                }
              } catch (e) {
                // Skip logs that can't be parsed
                continue;
              }
            }
          } catch (parseError) {
            console.error("Error parsing event logs:", parseError);
          }
        }        return pollId.toString();
      } else {
        // Using mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const newId = (this.mockPolls.length + 1).toString();
        const newPoll: Poll = {
          id: newId,
          question,
          options,
          counts: Array(options.length).fill(0),
          creator: this.userAddress || "0xYourAddressHere",
          isActive: true
        };
        
        this.mockPolls.push(newPoll);
        return newId;
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      throw new Error(`Failed to create poll: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async vote(pollId: string, choice: number): Promise<void> {
    try {
      if (this.isContractAvailable && this.contract) {
        const signer = await this.provider.getSigner();
        // Use proper typing for the contract with signer
        const contractWithSigner = this.contract.connect(signer) as unknown as ShadowVoteContract;
        
        const tx = await contractWithSigner.vote(pollId, choice);
        
        // For ethers v6 we need to wait for transaction confirmation
        if (typeof tx.wait === 'function') {
          const receipt = await tx.wait();
          console.log("Vote transaction confirmed:", receipt.hash);
        } else {
          console.warn("Transaction wait method not available");
        }
      } else {
        // Using mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const pollIndex = this.mockPolls.findIndex(p => p.id === pollId);
        if (pollIndex === -1) {
          throw new Error(`Poll with ID ${pollId} not found`);
        }
        
        const poll = this.mockPolls[pollIndex];
        if (!poll.isActive) {
          throw new Error("This poll is no longer active");
        }
        
        if (choice < 0 || choice >= poll.options.length) {
          throw new Error("Invalid choice index");
        }
        
        // Increment the vote count for the selected option
        poll.counts[choice]++;
        
        // Update the poll in the mock data
        this.mockPolls[pollIndex] = poll;
      }
    } catch (error) {
      console.error("Error voting:", error);
      throw new Error(`Failed to vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getAllPolls(): Promise<Poll[]> {
    try {
      if (this.isContractAvailable && this.contract) {
        const polls = await this.contract.getPolls();
        
        return polls.map((poll: any) => ({
          id: poll.id.toString(),
          question: poll.question,
          options: poll.options,
          counts: poll.counts.map((count: bigint) => Number(count)),
          creator: poll.creator,
          isActive: poll.isActive,
        }));
      } else {
        // Using mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        return [...this.mockPolls]; // Return a copy to prevent direct modification
      }
    } catch (error) {
      console.error("Error getting polls:", error);
      throw new Error(`Failed to get polls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getPoll(pollId: string): Promise<Poll> {
    try {
      if (this.isContractAvailable && this.contract) {
        const poll = await this.contract.getPoll(pollId);
        
        return {
          id: poll.id.toString(),
          question: poll.question,
          options: poll.options,
          counts: poll.counts.map((count: bigint) => Number(count)),
          creator: poll.creator,
          isActive: poll.isActive,
        };
      } else {
        // Using mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        const poll = this.mockPolls.find(p => p.id === pollId);
        if (!poll) {
          throw new Error(`Poll with ID ${pollId} not found`);
        }
        
        return { ...poll }; // Return a copy to prevent direct modification
      }
    } catch (error) {
      console.error(`Error getting poll ${pollId}:`, error);
      throw new Error(`Failed to get poll: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}