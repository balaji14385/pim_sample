import { db } from "@/db/index";
import { details } from "@/db/schema";
import { NextResponse,NextRequest } from "next/server";
export async function GET(req:NextRequest){
   try {
     let data=await db.select()
    .from(details)
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