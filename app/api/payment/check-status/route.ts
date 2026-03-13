import { NextResponse } from "next/server";
import { getXenditInvoicesByExternalId } from "@/lib/xendit";
import { updateBookingStatus } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const external_id = searchParams.get("external_id");

    if (!external_id) {
      return NextResponse.json({ error: "Missing external_id" }, { status: 400 });
    }

    console.log(`Checking status for external_id: ${external_id}`);
    const invoices = await getXenditInvoicesByExternalId(external_id);
    console.log(`Found ${invoices?.length || 0} invoices for this ID`);
    
    const invoice = invoices && invoices.length > 0 ? invoices[0] : null;

    if (!invoice) {
       console.warn(`No invoice found for external_id: ${external_id}`);
       return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    console.log(`Invoice status from Xendit: ${invoice.status}`);

    // If paid, update the database
    if (invoice.status === "PAID" || invoice.status === "SETTLED") {
       // Parse external_id: BOOKING|{timestamp}|{id1,id2,id3}
       const parts = external_id.split("|");
       if (parts[0] === "BOOKING" && parts[2]) {
         const bookingIds = parts[2].split(",");
         console.log(`Updating ${bookingIds.length} bookings to confirmed...`);
         
         const updateResults = await Promise.allSettled(
           bookingIds.map(id => updateBookingStatus(id, "confirmed"))
         );
         
         const errors = updateResults.filter(r => r.status === 'rejected');
         if (errors.length > 0) {
            console.error("Some database updates failed:", errors);
         } else {
            console.log("Database status updated successfully.");
         }
       }
    }

    return NextResponse.json({ status: invoice.status });
  } catch (error: any) {
    console.error("Check Status Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
