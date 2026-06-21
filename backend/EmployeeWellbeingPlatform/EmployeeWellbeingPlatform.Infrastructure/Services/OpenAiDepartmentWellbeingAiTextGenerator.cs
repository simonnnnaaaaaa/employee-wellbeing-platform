using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace EmployeeWellbeingPlatform.Infrastructure.Services;

public class OpenAiDepartmentWellbeingAiTextGenerator
    : IDepartmentWellbeingAiTextGenerator
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly LocalDepartmentWellbeingAiTextGenerator _fallbackGenerator;

    public OpenAiDepartmentWellbeingAiTextGenerator(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _fallbackGenerator = new LocalDepartmentWellbeingAiTextGenerator();
    }

    public async Task<DepartmentWellbeingInsightResponseDto> GenerateAsync(
        DepartmentWellbeingInsightAiInputDto input)
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

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.openai.com/v1/responses");

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

            var cleanedOutputText = CleanJsonOutput(outputText);

            using var aiJson = JsonDocument.Parse(cleanedOutputText);

            var summary = aiJson.RootElement
                .GetProperty("summary")
                .GetString();

            var recommendations = aiJson.RootElement
                .GetProperty("recommendations")
                .EnumerateArray()
                .Select(x => x.GetString() ?? "")
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();

            return new DepartmentWellbeingInsightResponseDto
            {
                Department = input.Department,
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

    private static string CleanJsonOutput(string outputText)
    {
        var cleaned = outputText.Trim();

        if (cleaned.StartsWith("```json"))
        {
            cleaned = cleaned.Substring("```json".Length).Trim();
        }
        else if (cleaned.StartsWith("```"))
        {
            cleaned = cleaned.Substring("```".Length).Trim();
        }

        if (cleaned.EndsWith("```"))
        {
            cleaned = cleaned.Substring(0, cleaned.Length - "```".Length).Trim();
        }

        return cleaned;
    }

    private static string BuildPrompt(DepartmentWellbeingInsightAiInputDto input)
    {
        var trendText = string.Join(
            "\n",
            input.DailyTrend
                .OrderBy(item => item.Date)
                .TakeLast(10)
                .Select(item =>
                    $"- {item.Date:yyyy-MM-dd}: stress {item.AverageStress:F1}/10, energy {item.AverageEnergy:F1}/10, check-ins {item.CheckInsCount}"));

        return $$"""
You are an AI wellbeing assistant for HR teams.

Analyze the wellbeing data for one department and return ONLY valid JSON.

Department data:
- Department: {{input.Department}}
- Total check-ins: {{input.TotalCheckIns}}
- Average stress: {{input.AverageStress:F1}}/10
- Average energy: {{input.AverageEnergy:F1}}/10
- High stress count: {{input.HighStressCount}}
- Risk score: {{input.RiskScore:F1}}/100
- Risk level: {{input.RiskLevel}}

Recent trend:
{{trendText}}

Requirements:
- Professional HR tone
- Non-medical language
- Department-level only
- No personal/employee-specific advice
- Concise insights
- Mention trend direction if visible from the data

Return JSON ONLY in this format:

{
  "summary": "short department wellbeing summary",
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}
""";
    }
}