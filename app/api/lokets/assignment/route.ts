import { NextRequest, NextResponse } from "next/server"
import { assignQueueEntryToLoket, completeLoketService } from "@/lib/loket-service"

export async function POST(request: NextRequest) {
  try {
    const { loketId, queueEntryId, staffId, action } = await request.json()

    if (!loketId || !queueEntryId) {
      return NextResponse.json(
        { error: "Missing required fields: loketId, queueEntryId" },
        { status: 400 }
      )
    }

    if (action === "assign") {
      const assignment = await assignQueueEntryToLoket(loketId, queueEntryId, staffId)
      return NextResponse.json({ assignment }, { status: 201 })
    } else if (action === "complete") {
      const result = await completeLoketService(loketId, queueEntryId)
      return NextResponse.json({ result }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[Loket Assignment API] Error:", error)
    return NextResponse.json({ error: "Failed to process assignment" }, { status: 500 })
  }
}
