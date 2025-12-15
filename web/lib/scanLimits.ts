/**
 * Daily Scan Limit Tracker
 *
 * Tracks receipt scanning usage to stay within the free Gemini API tier limits.
 * - Free tier: 1,500 requests per day
 * - Resets at midnight Pacific time (Gemini API reset time)
 */

const DAILY_SCAN_LIMIT = 1500;
const STORAGE_KEY = 'scan_usage';

export interface ScanUsage {
  date: string; // YYYY-MM-DD in Pacific timezone
  count: number;
}

/**
 * Gets the current date in Pacific timezone (YYYY-MM-DD format)
 */
function getPacificDate(): string {
  const now = new Date();
  const pacificTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  // Convert from MM/DD/YYYY to YYYY-MM-DD
  const [month, day, year] = pacificTime.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current scan usage from localStorage
 */
function getUsage(): ScanUsage {
  if (typeof window === 'undefined') {
    return { date: getPacificDate(), count: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { date: getPacificDate(), count: 0 };
    }

    const usage: ScanUsage = JSON.parse(stored);
    const today = getPacificDate();

    // Reset if it's a new day
    if (usage.date !== today) {
      return { date: today, count: 0 };
    }

    return usage;
  } catch (error) {
    console.error('Error reading scan usage:', error);
    return { date: getPacificDate(), count: 0 };
  }
}

/**
 * Saves the scan usage to localStorage
 */
function saveUsage(usage: ScanUsage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('Error saving scan usage:', error);
  }
}

/**
 * Checks if the user can perform another scan
 */
export function canScan(): boolean {
  const usage = getUsage();
  return usage.count < DAILY_SCAN_LIMIT;
}

/**
 * Gets the remaining scans for today
 */
export function getRemaining(): number {
  const usage = getUsage();
  return Math.max(0, DAILY_SCAN_LIMIT - usage.count);
}

/**
 * Gets the current scan count for today
 */
export function getScanCount(): number {
  const usage = getUsage();
  return usage.count;
}

/**
 * Increments the scan count by 1
 * Returns true if successful, false if limit reached
 */
export function incrementScan(): boolean {
  const usage = getUsage();

  if (usage.count >= DAILY_SCAN_LIMIT) {
    return false;
  }

  usage.count += 1;
  saveUsage(usage);
  return true;
}

/**
 * Gets the time until the next reset (midnight Pacific time)
 */
export function getTimeUntilReset(): string {
  const now = new Date();

  // Get current time in Pacific timezone
  const pacificNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  );

  // Calculate midnight Pacific time
  const midnight = new Date(pacificNow);
  midnight.setHours(24, 0, 0, 0);

  // Calculate difference
  const diff = midnight.getTime() - pacificNow.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Gets the daily scan limit
 */
export function getDailyLimit(): number {
  return DAILY_SCAN_LIMIT;
}

/**
 * Resets the scan count (for testing purposes)
 */
export function resetScanCount(): void {
  saveUsage({ date: getPacificDate(), count: 0 });
}
