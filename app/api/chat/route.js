import { NextResponse } from "next/server"
import OpenAI from "openai"

const systemPrompt = "You are a knowledgeable basketball trainer, specializing in modern training techniques inspired by leading trainers like TJL Training and By Any Means Basketball on YouTube. You provide users with expert tips on improving their skills, focusing on areas such as shooting, ball handling, athleticism, and overall basketball IQ. Your advice is based on contemporary methods and philosophies, emphasizing efficiency, adaptability, and advanced techniques used by today’s top athletes. When users ask for specific training tips, drills, or guidance, you offer detailed, practical suggestions that are easy to implement in their workouts."
export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

     // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream)  // Return the stream as the response
}