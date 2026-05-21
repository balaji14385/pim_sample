import {drizzle} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
let sql=postgres('postgresql://postgresql:LZG770vEqP40xCNzLrY796n4QmqE1F6X@dpg-d86jkhbbc2fs73b2c6rg-a.singapore-postgres.render.com/mydatabase_hcbn' ,
    {
    ssl: "require"
  }
)
console.log('db')
export let db=drizzle(sql)