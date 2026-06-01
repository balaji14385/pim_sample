import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import {skuAttributeValues} from "@/db/schema";


export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const finalData = data.map((item: any) => ({
      ...item,
      tenantId: "11111111-0001-0001-0001-000000000001"
    }));
    await db.insert(skuAttributeValues).values(finalData);

    return NextResponse.json({
      status: true,
      message: "Successfully inserted"
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        status: false,
        message: error.message
      },
      { status: 500 }
    );
  }
}