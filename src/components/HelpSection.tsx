import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, Shield, Flag, Archive, MessageCircle, Star, Tag } from 'lucide-react';

export const HelpSection: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const faqItems = [
    {
      id: 'review-rules',
      icon: <Star className="w-4 h-4" />,
      title: 'Review Rules',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Each account can only submit one review per business</p>
          <p>• Reviews must include a rating (1-5 stars) and a non-empty comment</p>
          <p>• Comments are limited to 1000 characters</p>
          <p>• You can add up to 5 tags (max 20 characters each)</p>
          <p>• Optional: Attach an image via IPFS</p>
          <p>• Reviews are permanent once submitted (but can be archived by admins)</p>
        </div>
      )
    },
    {
      id: 'owner-response',
      icon: <MessageCircle className="w-4 h-4" />,
      title: 'Business Owner Responses',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Only the registered business owner can respond to reviews</p>
          <p>• Each review can only receive one owner response</p>
          <p>• Responses cannot be edited once submitted</p>
          <p>• Business ownership must be assigned by an admin first</p>
          <p>• Responses help build trust and address customer concerns</p>
        </div>
      )
    },
    {
      id: 'moderation',
      icon: <Flag className="w-4 h-4" />,
      title: 'Moderation & Flagging',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Moderators and admins can flag inappropriate reviews</p>
          <p>• Flagged reviews are marked but remain visible</p>
          <p>• Flagging helps identify reviews that may violate community guidelines</p>
          <p>• Once flagged, a review cannot be unflagged</p>
          <p>• Flagged reviews can still be archived by admins</p>
        </div>
      )
    },
    {
      id: 'archiving',
      icon: <Archive className="w-4 h-4" />,
      title: 'Archiving Reviews',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Only admins can archive reviews</p>
          <p>• Archived reviews are soft-deleted, not permanently removed</p>
          <p>• This ensures transparency and audit compliance</p>
          <p>• Archived reviews are hidden from public view by default</p>
          <p>• Business owners and moderators can toggle to view archived reviews</p>
          <p>• Archiving is permanent and cannot be reversed</p>
        </div>
      )
    },
    {
      id: 'roles',
      icon: <Shield className="w-4 h-4" />,
      title: 'User Roles & Permissions',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Regular Users:</strong> Can add reviews and view public reviews</p>
          <p><strong>Business Owners:</strong> Can respond to reviews for their business</p>
          <p><strong>Moderators:</strong> Can flag inappropriate reviews and view archived content</p>
          <p><strong>Admins:</strong> Full control including archiving reviews and assigning business ownership</p>
          <p>• Roles are determined by smart contract permissions</p>
          <p>• Role-based access ensures security and proper governance</p>
        </div>
      )
    },
    {
      id: 'blockchain',
      icon: <Tag className="w-4 h-4" />,
      title: 'Blockchain & Transparency',
      content: (
        <div className="space-y-2 text-sm text-gray-600">
          <p>• All reviews are stored permanently on the blockchain</p>
          <p>• This ensures transparency and prevents censorship</p>
          <p>• Review data cannot be altered once submitted</p>
          <p>• All transactions are visible on Sepolia Etherscan</p>
          <p>• Smart contract code is open source and auditable</p>
          <p>• Gas fees apply for all write operations</p>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Help & FAQ</h2>
      </div>

      <div className="space-y-2">
        {faqItems.map((item) => (
          <div key={item.id} className="border rounded-lg">
            <button
              onClick={() => toggleSection(item.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-600">{item.icon}</span>
                <span className="font-medium text-left">{item.title}</span>
              </div>
              {openSection === item.id ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {openSection === item.id && (
              <div className="px-4 pb-3 border-t">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
        <p className="text-sm text-blue-700">
          This dApp is built on Ethereum's Sepolia testnet. Make sure you have:
        </p>
        <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
          <li>MetaMask or compatible Web3 wallet installed</li>
          <li>Sepolia testnet ETH for gas fees</li>
          <li>Connected to the correct network</li>
        </ul>
      </div>
    </div>
  );
};