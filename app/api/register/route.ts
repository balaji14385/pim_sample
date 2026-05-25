import { NextRequest, NextResponse } from "next/server";
import {db} from '@/db/index';
import { details } from "@/db/schema";
import { eq } from "drizzle-orm";
interface FormData {
  name: string;
  age: number;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  terms: boolean;
}


export async function POST(req: NextRequest) {
  try {
    const data: FormData =await req.json();
     const existingUser = await db.select()
        .from(details)
        .where(eq(details.email, data.email));
      console.log(existingUser.length)
    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          status:false,
          message:"Email already exists"
        },
        { status:400 }
      );
    }
  const userData = {
      name: data.name,
      age: Number(data.age),
      phone: data.phone,
      email: data.email,
      password: data.password,
      gender: data.gender,
      terms: data.terms
    }; 
 await db.insert(details).values(userData)
    return NextResponse.json(      {
        status: true,
        message:'successfully inserted the data',
        data,
        
      },
      {
        status: 200
      }
    );

  } 
  catch (error:any) {
    console.log(error);
    return NextResponse.json(
      {
        status: false,
        message:
          error.message ||
          "Something went wrong"
      },
      {
        status: 500
      }
    );
  }
}