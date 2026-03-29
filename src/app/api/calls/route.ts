import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, COLLECTION_NAME } from "@/lib/mongodb";
import { CallDocument, computeStatus, computeComposite } from "@/lib/types";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CallDocument>(COLLECTION_NAME);

    const docs = await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    const items = docs.map((doc) => ({
      _id: doc._id.toString(),
      timestamp: doc.timestamp,
      callId: doc.metadata?.call_id ?? null,
      status: computeStatus(doc.scores),
      compositeScore: computeComposite(doc.scores),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}
