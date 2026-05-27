# @halo-ai/ai

## Quick Start

```ts
const ModelProviderLive = ModelProvider.model("deepseek", "deepseek-v4-flash", {
  apiKey: Redacted.make("sk-xxxx"),
});

const program = Effect.gen(function* () {
  const response = yield* LanguageModel.generateText({
    prompt: "你好",
  });

  return response.text;
}).pipe(ModelProviderLive);
```
