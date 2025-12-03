import serverless from "serverless-http";
import { createApp } from "../backend/src/app";

const handler = serverless(createApp());

export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}

