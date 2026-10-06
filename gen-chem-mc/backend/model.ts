
export interface Env {
  AI: Ai;
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export default {
  async fetch(request, env): Promise<Response> {

     if(request.method === "OPTIONS") {
         return new Response(null, {
             status:204,
             headers: corsHeaders,
             });
         }
     if(request.method !== "POST") {
         return new Response("Send a POST request with a message.", {
             status: 405,
             headers: corsHeaders,
             });
         }
    //get message from student
    const body = await request.json() as {
        messages: {
            role: "user" | "assistant";
            content: string;
            }[];
        };
    const messages = [
      { role: "system", content: "You are a friendly assistant" },
        ...body.messages,
    ];

    /*const testMessages = [
      {
        role: "system",
        content: "You are a friendly assistant",
      },
      {
        role: "user",
        content: "What is an ionic bond?",
      },
    ];

    console.log("Sending test messages:", JSON.stringify(testMessages, null, 2));
    */
    const response = await env.AI.run("@cf/zai-org/glm-4.7-flash", { messages });

    return Response.json(response, {
        headers: corsHeaders,
        });
  },
} satisfies ExportedHandler<Env>;