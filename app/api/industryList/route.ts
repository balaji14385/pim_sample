import { NextRequest,NextResponse } from "next/server";
import { db } from "@/db/index";
import { industries } from "@/db/schema";


export async function GET(req:NextRequest) {
    try {
        let data=await db.select({id:industries.id,name:industries.name}).from(industries)       
        return NextResponse.json({
            status:true,
            message:"successfully fetch the data",
            data
        },{status:200})
    } catch (error:unknown) {
        console.log(error)

       return NextResponse.json({
        status:false,
        message:error.message || "Something went wrong" 
       },{status:500})   
    }
}