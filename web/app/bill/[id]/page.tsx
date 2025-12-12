'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBillFromFirebase } from '@/lib/billStorage';
import { Bill } from '@/types/bill';
import { TELEGRAM_CONFIG } from '@/config/telegram';

export default function BillDetail() {
  const params = useParams();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const billId = params.id as string;

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    setLoading(true);
    const loadedBill = await getBillFromFirebase(billId);
    setBill(loadedBill);
    setLoading(false);
  };

  const copyTelegramInstructions = async () => {
    const instructions = `Share this bill on Telegram:\n\n1. Open any Telegram chat\n2. Type: @${TELEGRAM_CONFIG.BOT_USERNAME}\n3. Add a space, then paste: ${billId}\n4. Send it!\n\n✨ Friends can tap dishes to select what they ate!`;

    await navigator.clipboard.writeText(billId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    alert(instructions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Bill not found</div>
          <Link href="/" className="text-[#10b981] hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const paidParticipants = bill.participants.filter(p => p.hasPaid);
  const unpaidParticipants = bill.participants.filter(p => !p.hasPaid);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{bill.restaurantName}</h1>
          <p className="text-gray-400">Paid by: {bill.paidBy}</p>
          <p className="text-gray-400 text-sm">
            {new Date(bill.date).toLocaleDateString('en-SG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="mt-4 text-3xl font-bold text-[#10b981]">
            ${bill.total.toFixed(2)}
          </div>
        </div>

        {/* Telegram Sharing */}
        <div className="bg-[#1a1a1a] border border-[#10b981] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">📱 Share on Telegram</h2>
          <p className="text-gray-400 mb-4">
            Let friends select what they ate using interactive buttons!
          </p>

          <button
            onClick={copyTelegramInstructions}
            className="w-full bg-[#10b981] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {copied ? '✓ Bill ID Copied!' : '📤 Share with Telegram Bot'}
          </button>

          <div className="mt-4 p-4 bg-[#0a0a0a] rounded border border-[#2a2a2a]">
            <p className="text-gray-400 text-sm mb-2">Bill ID:</p>
            <code className="text-[#10b981] break-all">{billId}</code>
          </div>
        </div>

        {/* Phase Status */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Status</h2>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              bill.phase === 'selection'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {bill.phase === 'selection' ? '📝 Selecting Dishes' : '✅ Payment Phase'}
            </span>
          </div>

          {bill.phase === 'selection' && (
            <p className="text-gray-400 mt-4">
              Waiting for participants to select their dishes on Telegram. Once everyone has selected, click "Lock & Calculate" in the Telegram message.
            </p>
          )}
        </div>

        {/* Dishes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Dishes</h2>
          <div className="space-y-2">
            {bill.dishes.map((dish, index) => (
              <div key={dish.id} className="flex justify-between text-gray-300">
                <span>{index + 1}. {dish.name}</span>
                <span className="font-medium">${dish.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Participants */}
        {bill.participants.length > 0 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Participants</h2>

            {bill.phase === 'selection' ? (
              <div className="space-y-3">
                {bill.participants.map((p) => (
                  <div key={p.telegramUserId} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-4">
                    <div className="font-medium text-white mb-2">{p.telegramUsername}</div>
                    <div className="text-sm text-gray-400">
                      {p.selectedDishIds.length > 0 ? (
                        <span>
                          Selected {p.selectedDishIds.length} dish{p.selectedDishIds.length !== 1 ? 'es' : ''}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not selected yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paidParticipants.length > 0 && (
                  <div>
                    <h3 className="text-green-400 font-medium mb-2">✅ Paid ({paidParticipants.length})</h3>
                    <div className="space-y-2">
                      {paidParticipants.map((p) => (
                        <div key={p.telegramUserId} className="bg-green-500/10 border border-green-500/20 rounded p-3">
                          <div className="text-white font-medium">{p.telegramUsername}</div>
                          <div className="text-green-400 font-bold">${p.amountOwed?.toFixed(2)}</div>
                          {p.paidBy && (
                            <div className="text-xs text-gray-400 mt-1">Marked by {p.paidBy}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unpaidParticipants.length > 0 && (
                  <div>
                    <h3 className="text-yellow-400 font-medium mb-2">⏳ Pending ({unpaidParticipants.length})</h3>
                    <div className="space-y-2">
                      {unpaidParticipants.map((p) => (
                        <div key={p.telegramUserId} className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                          <div className="text-white font-medium">{p.telegramUsername}</div>
                          <div className="text-yellow-400 font-bold">${p.amountOwed?.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Breakdown */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Bill Breakdown</h2>
          <div className="space-y-2 text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white">${bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.serviceChargePercentage > 0 && (
              <div className="flex justify-between">
                <span>Service Charge ({bill.serviceChargePercentage}%):</span>
                <span className="text-white">${bill.serviceChargeAmount.toFixed(2)}</span>
              </div>
            )}
            {bill.gstPercentage > 0 && (
              <div className="flex justify-between">
                <span>GST ({bill.gstPercentage}%):</span>
                <span className="text-white">${bill.gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#2a2a2a]">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-xl font-bold text-[#10b981]">${bill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
