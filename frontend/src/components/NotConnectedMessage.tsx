
import React from 'react';

export default function NotConnectedMessage() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
      <div className="text-8xl mb-4">🔒</div>
      <h2 className="text-xl font-bold mb-2">Wallet Connection Required</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Please connect your Ethereum wallet to access ShadowVote features.
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        <p className="mb-2">
          ShadowVote is a decentralized application that requires a wallet connection to:
        </p>
        <ul className="list-disc text-left ml-8 space-y-1">
          <li>Create new polls</li>
          <li>Vote on active polls</li>
          <li>Verify your identity on the blockchain</li>
          <li>Keep your votes secure and anonymous</li>
        </ul>
      </div>
    </div>
  );
}