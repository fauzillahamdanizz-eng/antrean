import { NextRequest, NextResponse } from "next/server"
import { createLoket, getLoketsByQueue, updateLoketStatus } from "@/lib/loket-service"

export async function GET(request: NextRequest) {
  try {
    const queueId = request.nextUrl.searchParams.get("queueId")

    if (!queueId) {
      return NextResponse.json({ error: "Missing queueId parameter" }, { status: 400 })
    }

    const lokets = await getLoketsByQueue(queueId)
    return NextResponse.json({ lokets }, { status: 200 })
  } catch (error) {
    console.error("[Loket API] Error fetching lokets:", error)
    return NextResponse.json({ error: "Failed to fetch lokets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { queueId, loketNumber, loketName } = await request.json()

    if (!queueId || !loketNumber || !loketName) {
      return NextResponse.json(
        { error: "Missing required fields: queueId, loketNumber, loketName" },
        { status: 400 }
      )
    }

    const loket = await createLoket(queueId, loketNumber, loketName)
    return NextResponse.json({ loket }, { status: 201 })
  } catch (error) {
    console.error("[Loket API] Error creating loket:", error)
    return NextResponse.json({ error: "Failed to create loket" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { loketId, status } = await request.json()

    if (!loketId || !status) {
      return NextResponse.json({ error: "Missing required fields: loketId, status" }, { status: 400 })
    }

    const loket = await updateLoketStatus(loketId, status)
    return NextResponse.json({ loket }, { status: 200 })
  } catch (error) {
    console.error("[Loket API] Error updating loket:", error)
    return NextResponse.json({ error: "Failed to update loket" }, { status: 500 })
  }
}
