const { z } = require("zod");
const schema = z.object({
    artifacts: z.object({
        latest: z.object({
            contract: z.object({ version: z.number().default(0), url: z.string().default("") }).default({ version: 0, url: "" }),
            assetFactoryInput: z.object({ version: z.number().default(0), url: z.string().default("") }).default({ version: 0, url: "" }),
            pdf: z.object({ version: z.number().default(1), url: z.string().default("") }).default({ version: 1, url: "" }),
        }).default({}),
        versions: z.array(z.object({
            type: z.string(),
            version: z.number(),
            createdAt: z.string(),
        })).default([]),
    }).default({ latest: { contract: { version: 0, url: "" }, assetFactoryInput: { version: 0, url: "" }, pdf: { version: 1, url: "" } }, versions: [] }),
}).passthrough();

const dataString = JSON.stringify({
    artifacts: {
        latest: {
            pdf: { version: 1, url: "http://example.com/pdf" }
        }
    }
});

try {
    const parsed = schema.parse(JSON.parse(dataString));
    console.log("Success:", JSON.stringify(parsed, null, 2));
} catch (e) {
    console.error("Zod Error:", e.issues);
}
