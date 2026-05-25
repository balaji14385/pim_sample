import { db } from "@/db/index";
import { details,manufacturers,brands} from "@/db/schema";
import { NextResponse,NextRequest } from "next/server";
export async function GET(req:NextRequest){
   try {
     let data=await db.select()
    .from(brands)
    return NextResponse.json({
        'status':true,
        data
    })
   } catch (error:any) {
    return NextResponse.json({
        'status':false,
        "message":error.message || "something went wrong"
    })
   }
}