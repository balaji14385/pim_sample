import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { products,brands } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function POST(req:NextRequest) {
    try {
        let data=await req.json()

const brandExists=await db
      .select()
      .from(brands)
      .where(eq(brands.id,data.brandId))
      .limit(1);

if(!brandExists){
   return NextResponse.json(
      {error:"Brand not found"},
      {status:400}
   );
}
        let finaldata={...data,tenantId: "11111111-0001-0001-0001-000000000001"
}
        await db.insert(products).values(
            finaldata
        )
        return NextResponse.json({
            status:false,
            message:"successfully inserted"
        },{status:200})
    } catch (error:unknown) {
        console.log(error)

       return NextResponse.json({
        status:false,
        message:error.message || "Something went wrong" 
       },{status:500})   
    }
}