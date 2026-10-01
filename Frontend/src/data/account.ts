// Single source of truth for the Ventures bank account.
// Shown everywhere a transfer is required. To change it after hosting,
// edit these three values — every page updates automatically.
export const VENTURES_ACCOUNT = {
  bank: 'Guaranty Trust Bank (GTBank)',
  accountNumber: '0123456789',
  accountName: 'University of Ibadan Ventures',
}

export function accountLines(): string[] {
  return [
    VENTURES_ACCOUNT.accountName,
    VENTURES_ACCOUNT.bank,
    `Account number: ${VENTURES_ACCOUNT.accountNumber}`,
  ]
}
