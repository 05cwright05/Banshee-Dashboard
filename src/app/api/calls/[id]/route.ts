import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise, { DB_NAME, COLLECTION_NAME } from "@/lib/mongodb";
import { CallDocument, computeStatus, computeComposite } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<CallDocument>(COLLECTION_NAME);

    let query: { _id: ObjectId | string };
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const doc = await collection.findOne(query as any);

    if (!doc) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const result = {
      ...doc,
      _id: doc._id.toString(),
      status: computeStatus(doc.scores),
      compositeScore: computeComposite(doc.scores),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch call:", error);
    return NextResponse.json(
      { error: "Failed to fetch call" },
      { status: 500 }
    );
  }
}
