export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: Array<any> }) => Promise<any>;
      on: (eventName: string, callback: (accounts: string[]) => void) => void;
      removeListener: (eventName: string, callback: (accounts: string[]) => void) => void;
    };
  }
}