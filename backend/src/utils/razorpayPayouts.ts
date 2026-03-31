import { IEventManager } from '../models/EventManager.js';

const getAuthHeaders = () => {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${auth}`
  };
};

export const createRazorpayContact = async (manager: IEventManager, referenceId: string) => {
  try {
    const sanitizedRef = referenceId.length > 40 
      ? `${referenceId.substring(0, 15)}...${referenceId.substring(referenceId.length - 22)}` 
      : referenceId;

    const contactData = {
      name: manager.name,
      email: manager.email,
      reference_id: sanitizedRef,
      type: 'vendor',
    };
    
    const response = await fetch('https://api.razorpay.com/v1/contacts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contactData)
    });
    const contact = await response.json();
    if (!response.ok) {
      console.error('Razorpay Contact Error:', response.status, contact);
      throw new Error(contact.error?.description || contact.message || 'Failed to create Razorpay Contact');
    }
    return contact;
  } catch (error) {
    console.error('Error creating Razorpay Contact:', error);
    throw error;
  }
};

export const createRazorpayFundAccount = async (contactId: string, manager: IEventManager) => {
  try {
    let fundAccountData: any = {
      contact_id: contactId,
    };

    if (manager.bankDetails && manager.bankDetails.accountNumber) {
      fundAccountData.account_type = 'bank_account';
      fundAccountData.bank_account = {
        name: manager.bankDetails.accountHolder || manager.name,
        ifsc: manager.bankDetails.ifscCode,
        account_number: manager.bankDetails.accountNumber,
      };
    } else if (manager.upiId) {
      fundAccountData.account_type = 'vpa';
      fundAccountData.vpa = {
        address: manager.upiId,
      };
    } else {
      throw new Error('Manager does not have bank details or UPI ID configured.');
    }

    const response = await fetch('https://api.razorpay.com/v1/fund_accounts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(fundAccountData)
    });
    const fundAccount = await response.json();
    if (!response.ok) {
      console.error('Razorpay Fund Account Error:', response.status, fundAccount);
      throw new Error(fundAccount.error?.description || fundAccount.message || 'Failed to create Razorpay Fund Account');
    }
    return fundAccount;
  } catch (error) {
    console.error('Error creating Razorpay Fund Account:', error);
    throw error;
  }
};

export const initiateRazorpayPayout = async (
  fundAccountId: string,
  amount: number,
  referenceId: string,
  purpose = 'payout',
  mode: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI' = 'IMPS'
) => {
  const accountNumber = process.env.RAZORPAY_X_ACCOUNT_NUMBER;
  if (!accountNumber) {
    throw new Error('RAZORPAY_X_ACCOUNT_NUMBER is not configured in environment variables.');
  }

  try {
    const sanitizedRef = referenceId.length > 40 
      ? `${referenceId.substring(0, 15)}...${referenceId.substring(referenceId.length - 22)}` 
      : referenceId;

    const payoutData = {
      account_number: accountNumber,
      fund_account_id: fundAccountId,
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      mode,
      purpose,
      reference_id: sanitizedRef,
      queue_if_low_balance: true,
    };

    const response = await fetch('https://api.razorpay.com/v1/payouts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payoutData)
    });
    const payout = await response.json();
    if (!response.ok) {
      console.error('Razorpay Payout Error:', response.status, payout);
      throw new Error(payout.error?.description || payout.message || 'Failed to initiate Razorpay Payout');
    }
    return payout;
  } catch (error) {
    console.error('Error initiating Razorpay Payout:', error);
    throw error;
  }
};
