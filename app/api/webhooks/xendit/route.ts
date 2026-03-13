import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/db";

const XENDIT_WEBHOOK_VERIFICATION_TOKEN = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN || "";

export async function POST(request: Request) {
  try {
    const callbackToken = request.headers.get("x-callback-token");

    // Verify webhook token
    if (XENDIT_WEBHOOK_VERIFICATION_TOKEN && callbackToken !== XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
      console.warn("Invalid callback token received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    console.log("Xendit Webhook Received:", payload);

    const { status, external_id } = payload;

    // Check if status is PAID or SETTLED
    if (status === "PAID" || status === "SETTLED") {
      // Parse external_id: BOOKING|{timestamp}|{id1,id2,id3}
      const parts = external_id.split("|");
      
      if (parts[0] === "BOOKING" && parts[2]) {
        const bookingIds = parts[2].split(",");
        
        console.log(`Updating ${bookingIds.length} bookings to confirmed...`);
        
        // Update each booking status to confirmed
        const results = await Promise.allSettled(
          bookingIds.map((id: string) => updateBookingStatus(id, "confirmed"))
        );
        
        const failed = results.filter(r => r.status === "rejected");
        if (failed.length > 0) {
          console.error(`Failed to update some bookings: ${failed.length} failed`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
