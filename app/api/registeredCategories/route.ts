import { eq} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { industries,categories,subCategories} from "@/db/schema";
import { db } from '@/db/index';
import { redis } from "@/lib/redis";

export async function GET() {
    try {
      const data=await db.select(
        {
     id:categories.id,
     categoryName: categories.name,
    categoryCode: categories.code,
    subCategory: subCategories.name,
    industryName: industries.name
        }
      ).from(categories)
      .leftJoin(subCategories,eq(subCategories.categoryId,categories.id))
      .innerJoin(industries,eq(industries.id,categories.industryId))
       try {
                         await redis.set('registeredCategories',data)
                        } catch (redisError) {
                            console.error("Failed to update Redis cache:", redisError);
                        }
        return NextResponse.json({
            status: true,
            message: "successfully fetch data",
            data
        }, { status: 200 })
    } catch (error: any) {
        console.log(error)

        return NextResponse.json({
            status: false,
            message: error.message || "Something went wrong"
        }, { status: 500 })
    }
} 