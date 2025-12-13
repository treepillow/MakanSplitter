export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate dish name
 * - Must not be empty
 * - Max 100 characters
 * - No special Markdown characters (prevents Telegram injection)
 */
export function validateDishName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Dish name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Dish name must be less than 100 characters' };
  }

  // Allow most characters but prevent Markdown injection
  // Blocked: ` * _ [ ] ( ) ~ > # + = | { } . ! - (at start of line)
  const dangerousStart = /^[`*_\[\]()~>#+=|{}.!-]/;
  if (dangerousStart.test(trimmed)) {
    return { valid: false, error: 'Dish name cannot start with special characters' };
  }

  return { valid: true };
}

/**
 * Validate price
 * - Must be positive number
 * - Max $10,000 (prevent abuse)
 * - Max 2 decimal places
 */
export function validatePrice(price: number): ValidationResult {
  if (isNaN(price) || price <= 0) {
    return { valid: false, error: 'Price must be a positive number' };
  }

  if (price > 10000) {
    return { valid: false, error: 'Price cannot exceed $10,000' };
  }

  // Check decimal places
  const decimals = (price.toString().split('.')[1] || '').length;
  if (decimals > 2) {
    return { valid: false, error: 'Price can have maximum 2 decimal places' };
  }

  return { valid: true };
}

/**
 * Validate "paid by" name
 * - Must not be empty
 * - Max 50 characters
 */
export function validatePaidBy(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter who paid the bill' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }

  return { valid: true };
}

/**
 * Validate GST/Service charge percentage
 * - Must be 0-100
 */
export function validatePercentage(value: number, name: string): ValidationResult {
  if (isNaN(value) || value < 0 || value > 100) {
    return { valid: false, error: `${name} must be between 0 and 100` };
  }

  return { valid: true };
}

/**
 * Sanitize text for Telegram Markdown
 * Escapes special Markdown characters
 */
export function sanitizeForTelegram(text: string): string {
  // Escape Markdown special characters
  return text.replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');
}

/**
 * Validate entire bill before saving
 */
export function validateBill(bill: {
  paidBy: string;
  dishes: Array<{ name: string; price: number }>;
  gstPercentage: number;
  serviceChargePercentage: number;
}): ValidationResult {
  // Validate paidBy
  const paidByValidation = validatePaidBy(bill.paidBy);
  if (!paidByValidation.valid) {
    return paidByValidation;
  }

  // Validate dishes
  if (!bill.dishes || bill.dishes.length === 0) {
    return { valid: false, error: 'Please add at least one dish' };
  }

  if (bill.dishes.length > 100) {
    return { valid: false, error: 'Maximum 100 dishes allowed' };
  }

  for (const dish of bill.dishes) {
    const nameValidation = validateDishName(dish.name);
    if (!nameValidation.valid) {
      return { valid: false, error: `Dish "${dish.name}": ${nameValidation.error}` };
    }

    const priceValidation = validatePrice(dish.price);
    if (!priceValidation.valid) {
      return { valid: false, error: `Dish "${dish.name}": ${priceValidation.error}` };
    }
  }

  // Validate percentages
  const gstValidation = validatePercentage(bill.gstPercentage, 'GST');
  if (!gstValidation.valid) {
    return gstValidation;
  }

  const serviceValidation = validatePercentage(bill.serviceChargePercentage, 'Service charge');
  if (!serviceValidation.valid) {
    return serviceValidation;
  }

  return { valid: true };
}
