const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || "";

/**
 * Common Xendit Error structure
 */
export interface XenditError {
  error_code: string;
  message: string;
}

/**
 * Xendit Invoice Response
 */
export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  description: string;
  expiry_date: string;
  invoice_url: string;
  customer: {
    given_names: string;
    email: string;
    mobile_number: string;
  };
  // ... other fields
}

/**
 * Create a Xendit Invoice
 */
export async function createXenditInvoice(data: {
  external_id: string;
  amount: number;
  payer_email?: string;
  description: string;
  customer?: {
    given_names?: string;
    surname?: string;
    email?: string;
    mobile_number?: string;
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
}): Promise<XenditInvoiceResponse> {
  if (!XENDIT_SECRET_KEY) {
    throw new Error("XENDIT_SECRET_KEY is not defined");
  }

  const authHeader = `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`;

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();

  if (!response.ok) {
    console.error("Xendit Error:", body);
    throw new Error(body.message || "Failed to create Xendit invoice");
  }

  return body as XenditInvoiceResponse;
}

/**
 * Get Xendit Invoice Status
 */
export async function getXenditInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
  if (!XENDIT_SECRET_KEY) {
    throw new Error("XENDIT_SECRET_KEY is not defined");
  }

  const authHeader = `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`;

  const response = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "Failed to fetch Xendit invoice");
  }

  return body as XenditInvoiceResponse;
}

/**
 * Get Xendit Invoices by External ID
 */
export async function getXenditInvoicesByExternalId(externalId: string): Promise<XenditInvoiceResponse[]> {
  if (!XENDIT_SECRET_KEY) {
    throw new Error("XENDIT_SECRET_KEY is not defined");
  }

  const authHeader = `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`;

  const response = await fetch(`https://api.xendit.co/v2/invoices?external_id=${externalId}`, {
    method: "GET",
    headers: {
      "Authorization": authHeader,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "Failed to fetch Xendit invoices");
  }

  return body as XenditInvoiceResponse[];
}
