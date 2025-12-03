import serverless from "serverless-http";
import { createApp } from "../../backend/src/app";

export const handler = serverless(createApp());
