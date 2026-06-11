import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { skuAttributeValues } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    for (const item of data) {
      const restorePro = await db
        .update(skuAttributeValues)
        .set({ status: true })
        .where(
          and(
            eq(skuAttributeValues.skuId, item.skuId),
            eq(skuAttributeValues.attributeId, item.attributeId)
          )
        )
        .returning();

      if (restorePro.length === 0) {
        await db.insert(skuAttributeValues).values({
          ...item,
          tenantId: "11111111-0001-0001-0001-000000000001",
        });
      }
    }

    return NextResponse.json({
      status: true,
      message: "Saved successfully",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        status: false,
        message: error.message || "something went wrong",
      },
      { status: 500 }
    );
  }
}