
import { corsHeaders } from "./utils.ts";

export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

export function createErrorResponse(message: string, code?: string, retries?: number, status = 500) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message,
      code,
      retries
    }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
