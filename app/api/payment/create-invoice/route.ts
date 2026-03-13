import { NextResponse } from "next/server";
import { createXenditInvoice } from "@/lib/xendit";

export async function POST(request: Request) {
  try {
    const { 
      amount, 
      customer_name, 
      customer_email, 
      customer_phone, 
      description,
      booking_ids // Assuming we pass the list of booking IDs created in "pending" status
    } = await responseToJson(request);

    // Origin for redirecting back to the app
    const origin = request.headers.get("origin") || "";

    // The external_id will be used to identify which bookings to update in the webhook.
    // Format: BOOKING|{timestamp}|{id1,id2,id3}
    const external_id = `BOOKING|${Date.now()}|${booking_ids.join(",")}`;

    const invoice = await createXenditInvoice({
      external_id,
      amount,
      payer_email: customer_email || "customer@example.com",
      description: description || `Booking for ${customer_name}`,
      customer: {
        given_names: customer_name,
        mobile_number: customer_phone,
        email: customer_email,
      },
      success_redirect_url: `${origin}/booking?status=success&external_id=${external_id}`,
      failure_redirect_url: `${origin}/booking`,
    });

    return NextResponse.json({ 
      invoice_url: invoice.invoice_url,
      external_id: invoice.external_id
    });
  } catch (error: any) {
    console.error("Create Invoice Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}

async function responseToJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
