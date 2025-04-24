
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FileText } from "lucide-react";

const ApiDocumentation = () => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">API Integration Documentation</h1>
      
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Integration Guide</AlertTitle>
        <AlertDescription>
          This document provides instructions for migrating from the mock API to the real taphoammo API.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="configuration">
        <TabsList className="mb-6">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="api-endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="error-handling">Error Handling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuration Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Base URL</h3>
                <p className="mb-2">When switching from the mock API to the real API, update the base URL in the EdgeFunction:</p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Replace in process-taphoammo-order/index.ts and sync-taphoammo/index.ts
const API_BASE_URL = "https://api.taphoammo.com/v1";
`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <p className="mb-2">The real API requires authentication headers. Add your API key to your environment variables:</p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Add to Supabase secrets
TAPHOAMMO_API_KEY=your_api_key_here

// Usage in edge functions
const apiKey = Deno.env.get('TAPHOAMMO_API_KEY');

// Add to request headers
headers: {
  "Authorization": \`Bearer \${apiKey}\`,
  "Content-Type": "application/json"
}
`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Request Parameters</h3>
                <p className="mb-2">The real API may require additional or different parameters:</p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Current mock API parameters
{
  kioskToken: string;
  userToken: string;
  quantity: number;
  promotion?: string;
}

// Possible real API parameters (verify with API docs)
{
  kiosk_id: string;         // Instead of kioskToken
  customer_id: string;      // Instead of userToken
  quantity: number;
  coupon_code?: string;     // Instead of promotion
  callback_url?: string;    // New parameter
}`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-endpoints">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">buyProducts Endpoint</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Mock API (current)
supabase.functions.invoke('mock-taphoammo', {
  body: JSON.stringify({ kioskToken, userToken, quantity, promotion })
})

// Real API (future)
fetch("https://api.taphoammo.com/v1/orders", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${apiKey}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ kiosk_id, customer_id, quantity, coupon_code })
})
`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">getProducts Endpoint</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Mock API (current)
supabase.functions.invoke('mock-taphoammo', {
  body: JSON.stringify({ orderId, userToken })
})

// Real API (future)
fetch(\`https://api.taphoammo.com/v1/orders/\${orderId}\`, {
  method: "GET",
  headers: {
    "Authorization": \`Bearer \${apiKey}\`,
    "Content-Type": "application/json"
  }
})
`}
                  </code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">getStock Endpoint</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Mock API (current)
supabase.functions.invoke('mock-taphoammo', {
  body: JSON.stringify({ kioskToken, userToken })
})

// Real API (future)
fetch(\`https://api.taphoammo.com/v1/products/\${kioskId}\`, {
  method: "GET",
  headers: {
    "Authorization": \`Bearer \${apiKey}\`,
    "Content-Type": "application/json"
  }
})
`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="error-handling">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Common Error Scenarios</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Error Code</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-left py-2">Handling Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">400</td>
                      <td>Invalid request parameters</td>
                      <td>Validate all parameters before sending</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">401</td>
                      <td>Authentication failed</td>
                      <td>Verify API key is valid and properly formatted</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">404</td>
                      <td>Product not found</td>
                      <td>Ensure kiosk IDs are correct and active</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">429</td>
                      <td>Rate limit exceeded</td>
                      <td>Implement retry logic with exponential backoff</td>
                    </tr>
                    <tr>
                      <td className="py-2">5xx</td>
                      <td>Server errors</td>
                      <td>Implement retry with backoff, alert system admins</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Network Issues</h3>
                <p>The real API may experience network issues not present in the mock API:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Implement timeouts for all API calls (recommended: 10-15 seconds)</li>
                  <li>Add retry logic for failed requests (max 3 retries with exponential backoff)</li>
                  <li>Implement circuit breaker pattern to prevent cascade failures</li>
                  <li>Cache successful responses where appropriate</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Response Format Differences</h3>
                <p>Real API might return data in a different format:</p>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  <code>
                    {`// Mock API response
{
  "success": "true",
  "order_id": "ABC123",
  "product_keys": ["KEY-1", "KEY-2"]
}

// Possible real API response
{
  "status": "success",
  "data": {
    "id": "ABC123",
    "keys": [
      { "serial": "KEY-1", "expires_at": "2023-12-31" },
      { "serial": "KEY-2", "expires_at": "2023-12-31" }
    ],
    "status": "completed"
  }
}

// Implement adapter functions to normalize responses`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;
