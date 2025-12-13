import { Bill, BillCalculation, Dish, Person } from '../types/bill';

export function calculateBill(
  dishes: Dish[],
  people: Person[],
  gstPercentage: number,
  serviceChargePercentage: number
): BillCalculation {
  // Calculate subtotal
  const subtotal = dishes.reduce((sum, dish) => sum + dish.price, 0);

  // Calculate service charge on subtotal
  const serviceCharge = subtotal * (serviceChargePercentage / 100);

  // Calculate GST on (subtotal + service charge)
  const gst = (subtotal + serviceCharge) * (gstPercentage / 100);

  // Calculate total
  const total = subtotal + serviceCharge + gst;

  // Calculate per-person breakdown
  const perPersonBreakdown = people.map((person) => {
    // Find all dishes this person shared
    const dishesEaten = dishes
      .filter((dish) => dish.sharedBy.includes(person.id))
      .map((dish) => {
        // Calculate this person's share of the dish
        const numberOfPeople = dish.sharedBy.length;
        const shareAmount = dish.price / numberOfPeople;

        return {
          dishName: dish.name,
          dishPrice: dish.price,
          shareAmount,
        };
      });

    // Calculate person's subtotal
    const personSubtotal = dishesEaten.reduce(
      (sum, dish) => sum + dish.shareAmount,
      0
    );

    // Calculate person's share of service charge
    const personServiceCharge = personSubtotal * (serviceChargePercentage / 100);

    // Calculate person's share of GST
    const personGst = (personSubtotal + personServiceCharge) * (gstPercentage / 100);

    // Calculate person's total
    const personTotal = personSubtotal + personServiceCharge + personGst;

    return {
      personId: person.id,
      personName: person.name,
      dishesEaten,
      subtotal: personSubtotal,
      serviceCharge: personServiceCharge,
      gst: personGst,
      total: personTotal,
    };
  });

  return {
    subtotal,
    serviceCharge,
    gst,
    total,
    perPersonBreakdown,
  };
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function generateTelegramMessage(
  bill: Bill,
  calculation: BillCalculation
): string {
  let message = `🍜 *Bill Split*\n`;
  message += `📅 ${new Date(bill.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}\n`;
  message += `━━━━━━━━━━━━━━━━\n\n`;

  message += `💰 *Total Bill: ${formatCurrency(calculation.total)}*\n`;
  message += `   Subtotal: \`${formatCurrency(calculation.subtotal)}\`\n`;

  if (bill.serviceChargePercentage > 0) {
    message += `   Service (${bill.serviceChargePercentage}%): \`${formatCurrency(calculation.serviceCharge)}\`\n`;
  }

  if (bill.gstPercentage > 0) {
    message += `   GST (${bill.gstPercentage}%): \`${formatCurrency(calculation.gst)}\`\n`;
  }

  message += `\n👤 *Paid by:* ${bill.paidBy}\n`;
  message += `━━━━━━━━━━━━━━━━\n\n`;

  message += `👥 *Who Owes What*\n\n`;

  calculation.perPersonBreakdown.forEach((person) => {
    const isPaid = bill.people.find(p => p.id === person.personId)?.hasPaid;
    const statusIcon = isPaid ? '✅' : '💸';

    message += `${statusIcon} *${person.personName}*\n`;

    person.dishesEaten.forEach((dish) => {
      message += `   • ${dish.dishName}\n`;
    });

    message += `   *Amount Owed: ${formatCurrency(person.total)}*\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━\n`;
  message += `💳 PayNow/PayLah to *${bill.paidBy}*`;

  return message;
}

export function generateWhatsAppMessage(
  bill: Bill,
  calculation: BillCalculation
): string {
  let message = `🍜 *Bill Split*\n`;
  message += `📅 ${new Date(bill.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}\n`;
  message += `━━━━━━━━━━━━━━━━\n\n`;

  message += `💰 *Total Bill: ${formatCurrency(calculation.total)}*\n`;
  message += `   Subtotal: ${formatCurrency(calculation.subtotal)}\n`;

  if (bill.serviceChargePercentage > 0) {
    message += `   Service (${bill.serviceChargePercentage}%): ${formatCurrency(calculation.serviceCharge)}\n`;
  }

  if (bill.gstPercentage > 0) {
    message += `   GST (${bill.gstPercentage}%): ${formatCurrency(calculation.gst)}\n`;
  }

  message += `\n👤 *Paid by:* ${bill.paidBy}\n`;
  message += `━━━━━━━━━━━━━━━━\n\n`;

  message += `👥 *Who Owes What*\n\n`;

  calculation.perPersonBreakdown.forEach((person) => {
    const isPaid = bill.people.find(p => p.id === person.personId)?.hasPaid;
    const statusIcon = isPaid ? '✅' : '💸';

    message += `${statusIcon} *${person.personName}*\n`;

    person.dishesEaten.forEach((dish) => {
      message += `   • ${dish.dishName}\n`;
    });

    message += `   *Amount Owed: ${formatCurrency(person.total)}*\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━\n`;
  message += `💳 PayNow/PayLah to *${bill.paidBy}*`;

  return message;
}
