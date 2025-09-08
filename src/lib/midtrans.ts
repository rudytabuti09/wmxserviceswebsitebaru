import { CoreApi, Snap } from "midtrans-client";

// Initialize Snap API
export const snap = new Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// Initialize Core API (for server-to-server communication)
export const coreApi = new CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export interface MidtransTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
  }>;
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  merchant_id: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  fraud_status?: string;
  signature_key: string;
}
