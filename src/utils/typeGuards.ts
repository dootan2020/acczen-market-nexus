
import { Deposit } from '@/types/deposits';

/**
 * Converts raw deposit data from Supabase to the Deposit type
 * by ensuring metadata is in the correct format
 */
export function convertToDeposit(deposit: any): Deposit {
  return {
    ...deposit,
    metadata: typeof deposit.metadata === 'undefined' ? null : deposit.metadata,
    profiles: deposit.profiles || null
  };
}

/**
 * Converts an array of raw deposit data from Supabase to Deposit[] type
 */
export function convertToDeposits(deposits: any[]): Deposit[] {
  return deposits?.map(convertToDeposit) || [];
}
