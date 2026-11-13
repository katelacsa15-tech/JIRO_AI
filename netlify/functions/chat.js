exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Gemini API key is not configured."
                })
            };
        }

        const { message, image } = JSON.parse(event.body || "{}");

        const text = typeof message === "string" ? message.trim() : "";

        if (!text && !image) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Please enter a message or upload an image."
                })
            };
        }

        const parts = [];

        if (image) {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (
                !allowedTypes.includes(image.mimeType) ||
                typeof image.data !== "string" ||
                !image.data
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: "Unsupported or invalid image."
                    })
                };
            }

            if (image.data.length > 4 * 1024 * 1024) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: "Image is too large. Please use a smaller image."
                    })
                };
            }

            parts.push({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.data
                }
            });
        }

        parts.push({
            text: text || "Please describe this image."
        });

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: "You are JIRO AI, a helpful and friendly AI assistant. Answer clearly and naturally."
                        }]
                    },
                    contents: [{
                        parts: parts
                    }],
                    generationConfig: {
                        maxOutputTokens: 800
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            return {
                statusCode: 502,
                body: JSON.stringify({
                    error: data.error?.message ||
                        "Gemini API request failed."
                })
            };
        }

        const reply = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!reply) {
            throw new Error("No text response received.");
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Something went wrong. Please try again."
            })
        };
    }
};
