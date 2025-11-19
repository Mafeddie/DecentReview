import React from 'react';
import { useContract } from '../hooks/useContract';
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export const TransactionStatus: React.FC = () => {
  const { transactionStatus } = useContract();

  if (!transactionStatus) return null;

  const getIcon = () => {
    switch (transactionStatus.type) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getColorClass = () => {
    switch (transactionStatus.type) {
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg border ${getColorClass()} shadow-lg z-50`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium">{transactionStatus.message}</p>
          {transactionStatus.txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionStatus.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm underline mt-1"
            >
              <span>View on Etherscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};