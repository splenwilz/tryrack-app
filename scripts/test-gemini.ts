import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Test script to measure Gemini API image generation latency
 * Using structure similar to docs but with working @google/generative-ai package
 * 
 * Usage:
 * 1. Set GEMINI_API_KEY environment variable
 * 2. Place a test image at ./cat.png (or update imagePath)
 * 3. Run: npx tsx scripts/test-gemini.ts
 * 
 * @see https://ai.google.dev/docs - Google Generative AI SDK
 */

async function main() {
    const totalStartTime = Date.now();

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: GEMINI_API_KEY environment variable is not set");
        console.log("Set it with: export GEMINI_API_KEY=your_key_here");
        process.exit(1);
    }

    // Initialize Gemini client (using @google/generative-ai which we know works)
    const ai = new GoogleGenerativeAI(apiKey);

    // Image path - adjust as needed
    const imagePath = path.join(process.cwd(), "shirt.HEIC");

    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Error: Image file not found at ${imagePath}`);
        console.log("Please place a test image at ./cat.png or update the imagePath variable");
        process.exit(1);
    }

    console.log(`📸 Reading image from: ${imagePath}`);
    const readStartTime = Date.now();
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");
    const readDuration = Date.now() - readStartTime;
    console.log(`✅ Image read and encoded in ${readDuration}ms (${(imageData.length / 1024).toFixed(2)}KB)`);

    // Prepare prompt with image and wardrobe extraction instructions
    const wardrobeExtractionPrompt = `Extract wardrobe item metadata. Return ONLY valid JSON:

{
  "title": "short descriptive name (max 50 chars)",
  "category": "lowercase singular term (e.g., blazer, t-shirt, jeans, dress, sneaker, handbag)",
  "colors": ["1-3 specific colors with shades like navy blue, burgundy, olive green"],
  "tags": ["3-5 tags: style/material/occasion/season/fit"]
}

Rules: category=lowercase singular (blazer not Blazer, sneaker not sneakers). colors=specific shades. tags=3-5 descriptive. Return JSON only.`;

    const prompt = [
        {
            text: wardrobeExtractionPrompt,
        },
        {
            inlineData: {
                mimeType: imagePath.endsWith('.HEIC') ? "image/heic" : "image/png",
                data: base64Image,
            },
        },
    ];

    // Get model and generate content (exact structure from docs)
    console.log("🤖 Calling Gemini API...");
    const apiStartTime = Date.now();

    try {
        // Step 1: Extract metadata using vision model
        console.log("🔍 Step 1: Extracting metadata...");
        const metadataStartTime = Date.now();
        const visionModel = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const metadataResult = await visionModel.generateContent({
            contents: [{ role: "user", parts: prompt }],
        });
        const metadataResponse = metadataResult.response;
        const metadataDuration = Date.now() - metadataStartTime;
        console.log(`✅ Metadata extraction completed in ${metadataDuration}ms`);

        // Extract JSON metadata
        const metadataText = metadataResponse.text();
        let metadataJson: Record<string, unknown> | null = null;

        console.log("\n📝 Metadata response:");
        console.log(metadataText);

        try {
            const jsonMatch = metadataText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                metadataText.match(/(\{[\s\S]*\})/);

            if (jsonMatch) {
                metadataJson = JSON.parse(jsonMatch[1]);
            } else {
                metadataJson = JSON.parse(metadataText.trim());
            }
            console.log("\n✅ Extracted wardrobe metadata:");
            console.log(JSON.stringify(metadataJson, null, 2));
        } catch (parseError) {
            console.log("\n⚠️ Could not parse JSON from metadata response");
            if (parseError instanceof Error) {
                console.log("Parse error:", parseError.message);
            }
        }

        // Step 2: Generate processed image using image generation model
        console.log("\n🎨 Step 2: Generating processed image...");
        const imageStartTime = Date.now();
        const imageModel = ai.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const imagePrompt = [
            {
                text: "Transform this clothing item into a professional catalog image. Straighten wrinkles/folds, center on stylish minimalist background (soft gradient or studio backdrop). Output polished, app-ready result.",
            },
            {
                inlineData: {
                    mimeType: imagePath.endsWith('.HEIC') ? "image/heic" : "image/png",
                    data: base64Image,
                },
            },
        ];
        const imageResult = await imageModel.generateContent({
            contents: [{ role: "user", parts: imagePrompt }],
        });
        const imageResponse = imageResult.response;
        const imageDuration = Date.now() - imageStartTime;
        console.log(`✅ Image generation completed in ${imageDuration}ms`);

        // Process image response
        const processStartTime = Date.now();
        interface Part {
            text?: string;
            inlineData?: {
                mimeType: string;
                data: string;
            };
        }

        const parts: Part[] = imageResponse.candidates?.[0]?.content?.parts || [];
        let imageSaved = false;

        for (const part of parts) {
            if (part.inlineData) {
                imageSaved = true;
                console.log(`\n🖼️ Found inline image data (${part.inlineData.mimeType})`);
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, "base64");
                const outputPath = path.join(process.cwd(), "wardrobe_item_processed.png");
                fs.writeFileSync(outputPath, buffer);
                const processDuration = Date.now() - processStartTime;
                console.log(`💾 Image saved as wardrobe_item_processed.png (${(buffer.length / 1024).toFixed(2)}KB, processing: ${processDuration}ms)`);
            }
        }

        // Save metadata to JSON file if extracted
        if (metadataJson) {
            const metadataPath = path.join(process.cwd(), "wardrobe_metadata.json");
            fs.writeFileSync(metadataPath, JSON.stringify(metadataJson, null, 2));
            console.log(`\n💾 Metadata saved as wardrobe_metadata.json`);
        }

        const apiDuration = Date.now() - apiStartTime;

        // Summary
        console.log("\n📊 Response Summary:");
        console.log(`  - Metadata extracted: ${metadataJson ? '✅' : '❌'}`);
        console.log(`  - Image generated: ${imageSaved ? '✅' : '❌'}`);

        const totalDuration = Date.now() - totalStartTime;
        console.log("\n📊 Timing Breakdown:");
        console.log(`  - Image read/encode: ${readDuration}ms`);
        console.log(`  - Metadata extraction: ${metadataDuration}ms`);
        console.log(`  - Image generation: ${imageDuration}ms`);
        console.log(`  - Total API time: ${apiDuration}ms`);
        console.log(`  - Total time: ${totalDuration}ms`);
    } catch (error) {
        const apiDuration = Date.now() - apiStartTime;
        console.error(`❌ Error after ${apiDuration}ms:`, error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});
