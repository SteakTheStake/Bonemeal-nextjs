import { setTimeout as delay } from "node:timers/promises";

const HF_INFERENCE_URL = "https://api-inference.huggingface.co/models";
const DEFAULT_RETRIES = 5;
const DEFAULT_WAIT_SECONDS = 5;
const DEPTH_MODEL = "jingheya/lotus-depth-g-v1-0";
const TEXTURE_MODEL = "dog-god/texture-synthesis-sdxl-lora";

type InvokeOptions = {
  contentType?: string;
  accept?: string;
  retries?: number;
};

type InvokeResult = {
  contentType: string;
  buffer?: Buffer;
  json?: any;
};

export class HuggingFaceClient {
  private readonly apiKey = process.env.HUGGING_FACE_API_KEY?.trim();

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async generateDepthMap(imageBuffer: Buffer): Promise<Buffer> {
    const { buffer, json, contentType } = await this.invokeModel(DEPTH_MODEL, imageBuffer, {
      contentType: "image/png",
      accept: "image/png",
    });

    if (json) {
      throw new Error(json.error ?? "Unexpected response from Hugging Face depth model");
    }

    if (!buffer || !contentType.startsWith("image/")) {
      throw new Error(`Hugging Face depth model returned unexpected content type: ${contentType || "unknown"}`);
    }

    return buffer;
  }

  async generateTexture(prompt: string, negativePrompt?: string): Promise<Buffer> {
    const payload = {
      inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt || undefined,
        width: 1024,
        height: 1024,
        guidance_scale: 7,
        num_inference_steps: 30,
      },
    };

    const serialized = Buffer.from(JSON.stringify(payload));

    const { buffer, json, contentType } = await this.invokeModel(TEXTURE_MODEL, serialized, {
      contentType: "application/json",
    });

    if (json) {
      throw new Error(json.error ?? "Unexpected response from Hugging Face texture model");
    }

    if (!buffer || !contentType.startsWith("image/")) {
      throw new Error(`Hugging Face texture model returned unexpected content type: ${contentType || "unknown"}`);
    }

    return buffer;
  }

  private async invokeModel(model: string, payload: Buffer | string, options: InvokeOptions = {}): Promise<InvokeResult> {
    if (!this.apiKey) {
      throw new Error("HUGGING_FACE_API_KEY is not configured on the server.");
    }

    const retries = options.retries ?? DEFAULT_RETRIES;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (options.contentType) {
      headers["Content-Type"] = options.contentType;
    }
    if (options.accept) {
      headers.Accept = options.accept;
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      const response = await fetch(`${HF_INFERENCE_URL}/${model}`, {
        method: "POST",
        headers,
        body: payload,
      });

      if ([429, 503].includes(response.status)) {
        const payloadJson = await response.json().catch(() => ({}));
        const waitSeconds = typeof payloadJson?.estimated_time === "number" && payloadJson.estimated_time > 0
          ? Math.min(payloadJson.estimated_time, 30)
          : DEFAULT_WAIT_SECONDS;
        await delay(waitSeconds * 1000);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face request failed (${response.status}): ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const json = await response.json();
        return { contentType, json };
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return { contentType, buffer };
    }

    throw new Error(`Model ${model} is busy. Please try again in a moment.`);
  }
}

export const huggingFaceClient = new HuggingFaceClient();
