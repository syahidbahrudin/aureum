import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {
  dispatchIngest,
  processArchiveEnrich,
  processIngest,
} from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dispatchIngest, processIngest, processArchiveEnrich],
});