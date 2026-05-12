using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using Microsoft.Extensions.Configuration;

namespace EmployeeWellbeingPlatform.Infrastructure.Services;

public class OpenAiWellbeingAiTextGenerator : IWellbeingAiTextGenerator
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly LocalWellbeingAiTextGenerator _fallbackGenerator;

    public OpenAiWellbeingAiTextGenerator(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _fallbackGenerator = new LocalWellbeingAiTextGenerator();
    }

    public async Task<WellbeingInsightResponseDto> GenerateAsync(WellbeingInsightAiInputDto input)
    {
        try
        {
            var apiKey = _configuration["OpenAI:ApiKey"];
            var model = _configuration["OpenAI:Model"] ?? "gpt-4.1-mini";

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return await _fallbackGenerator.GenerateAsync(input);
            }

            var requestBody = new
            {
                model,
                input = BuildPrompt(input)
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses");

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                return await _fallbackGenerator.GenerateAsync(input);
            }

            var json = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(json);

            var outputText = document.RootElement
                .GetProperty("output")[0]
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(outputText))
            {
                return await _fallbackGenerator.GenerateAsync(input);
            }

            using var aiJson = JsonDocument.Parse(outputText);

            var summary =
                aiJson.RootElement
                    .GetProperty("summary")
                    .GetString();

            var recommendations =
                aiJson.RootElement
                    .GetProperty("recommendations")
                    .EnumerateArray()
                    .Select(x => x.GetString() ?? "")
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .ToList();

            return new WellbeingInsightResponseDto
            {
                RiskScore = input.RiskScore,
                RiskLevel = input.RiskLevel,
                Summary = summary ?? "",
                Recommendations = recommendations
            };
        }
        catch
        {
            return await _fallbackGenerator.GenerateAsync(input);
        }
    }

    private static string BuildPrompt(WellbeingInsightAiInputDto input)
    {
        return $$"""
You are an AI wellbeing assistant for employees.

Analyze the employee wellbeing data and return ONLY valid JSON.

Employee data:
- Risk score: {{input.RiskScore}}/100
- Risk level: {{input.RiskLevel}}
- Average stress: {{input.AverageStress:F1}}/10
- Average energy: {{input.AverageEnergy:F1}}/10
- High stress days: {{input.HighStressDays}}
- Low energy days: {{input.LowEnergyDays}}
- Increasing stress trend: {{input.HasIncreasingStressTrend}}
- Check-ins analyzed: {{input.CheckInCount}}

Requirements:
- Tone must be supportive and professional
- Non-medical language
- Keep responses concise

Return JSON ONLY in this format:

{
  "summary": "short wellbeing summary",
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}
""";
    }
}