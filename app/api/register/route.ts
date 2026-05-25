import { NextRequest, NextResponse } from "next/server";
import {db} from '@/db/index';
import { users } from "@/db/schema";
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
    console.log(data)
  const userData = {
      name: data.name,
      age: Number(data.age),
      phone: data.phone,
      email: data.email,
      password: data.password,
      gender: data.gender,
      terms: data.terms
    }; 
 await db.insert(users).values(userData)
    return NextResponse.json(      {
        'status': true,
        'message':'successfully inserted the data',
        data,
        
      },
      {
        status: 200
      }
    );

  } 
  catch (error: any) {
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