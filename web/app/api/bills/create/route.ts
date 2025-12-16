import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { validateBill } from '@/utils/validation';

// Simple in-memory rate limiter (use Redis in production for multi-instance)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, limit] of rateLimits.entries()) {
    if (now > limit.resetAt) {
      rateLimits.delete(ip);
    }
  }
}, 60000);

function rateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Rate limit: 5 bills per minute per IP
    if (!rateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many bill creations. Please wait a minute and try again.'
        },
        { status: 429 }
      );
    }

    const billData = await request.json();

    // Validate that ID is provided
    if (!billData.id || typeof billData.id !== 'string') {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Bill ID is required' },
        { status: 400 }
      );
    }

    // Validate bill data
    const validation = validateBill({
      paidBy: billData.paidBy,
      dishes: billData.dishes || [],
      gstPercentage: billData.gstPercentage || 0,
      serviceChargePercentage: billData.serviceChargePercentage || 0,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', message: validation.error },
        { status: 400 }
      );
    }

    // Additional validation
    if (!billData.dishes || billData.dishes.length === 0) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'At least one dish is required' },
        { status: 400 }
      );
    }

    // Limit total bill value to prevent abuse
    const totalValue = billData.subtotal + billData.gstAmount + billData.serviceChargeAmount;
    if (totalValue > 50000) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Bill total cannot exceed $50,000' },
        { status: 400 }
      );
    }

    // Create bill with server timestamp using client-provided ID
    // Set TTL for automatic deletion after 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const billToSave = {
      ...billData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      phase: 'selection',
      participants: [],
      expiresAt: expiresAt, // Firebase will auto-delete bills older than this
    };

    // Save to Firestore with the client-provided ID
    const billRef = doc(db, 'bills', billData.id);
    await setDoc(billRef, billToSave);

    // Increment total bills counter (fire and forget - don't wait)
    updateDoc(doc(db, 'stats', 'counters'), {
      totalBills: increment(1),
      lastUpdated: serverTimestamp()
    }).catch(async (error) => {
      // If counter doesn't exist, create it
      if (error.code === 'not-found') {
        await setDoc(doc(db, 'stats', 'counters'), {
          totalBills: 1,
          lastUpdated: serverTimestamp()
        }).catch(() => {
          // Silently fail - counter is not critical
          console.warn('Failed to create counter document');
        });
      }
    });

    console.log('Bill created successfully:', billData.id, 'from IP:', ip);

    return NextResponse.json({
      success: true,
      id: billData.id
    });

  } catch (error: any) {
    console.error('Error creating bill:', error);

    // Don't expose internal errors to client
    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { error: 'Permission denied', message: 'Unable to save bill. Please try again.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to create bill. Please try again.' },
      { status: 500 }
    );
  }
}

// Reject other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
