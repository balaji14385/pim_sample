import { eq} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { industries,categories,subCategories} from "@/db/schema";
import { db } from '@/db/index';

export async function GET() {
    try {
      const data=await db.select(
        {
     categoryName: categories.name,
    categoryCode: categories.code,
    subCategory: subCategories.name,
    industryName: industries.name
        }
      ).from(categories)
      .leftJoin(subCategories,eq(subCategories.categoryId,categories.id))
      .innerJoin(industries,eq(industries.id,categories.industryId))
       
        return NextResponse.json({
            status: true,
            message: "successfully fetch data",
            data
        }, { status: 200 })
    } catch (error: unknown) {
        console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
    }
} 