
import { MongoClient, ServerApiVersion } from "mongodb"
import { env } from "~/config/environment"


// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null do chưa kết nối tới db
let trelloDatabaseInstance = null

/** Khởi tạo 1 đối tượng mongoClientInstance để kết nối tới MongoDB */
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    throw new Error("Database not connected")
  }
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
