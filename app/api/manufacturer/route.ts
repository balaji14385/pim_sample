import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { manufacturers } from "@/db/schema";

export async function POST(req:NextRequest) {
    try {
        let data=await req.json()
        
        let finaldata={...data,tenantId: "11111111-0001-0001-0001-000000000001"
}
        await db.insert(manufacturers).values(
            finaldata
        )
        return NextResponse.json({
            status:true,
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