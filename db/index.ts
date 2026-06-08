import {drizzle} from 'drizzle-orm/postgres-js'
import "dotenv/config";
import postgres from 'postgres'
let sql=postgres(process.env.DATABASE_URL! ,
    {
    ssl: "require"
  }
)
export let db=drizzle(sql)