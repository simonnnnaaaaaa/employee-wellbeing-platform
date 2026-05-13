using EmployeeWellbeingPlatform.Application.Ai;
using EmployeeWellbeingPlatform.Application.Ai.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace EmployeeWellbeingPlatform.Infrastructure.Services;

public class OpenAiHrWellbeingAiTextGenerator : IHrWellbeingAiTextGenerator
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly LocalHrWellbeingAiTextGenerator _fallbackGenerator;

    public OpenAiHrWellbeingAiTextGenerator(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _fallbackGenerator = new LocalHrWellbeingAiTextGenerator();
    }

    public async Task<HrWellbeingSummaryResponseDto> GenerateAsync(
        HrWellbeingSummaryAiInputDto input)
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

            return new HrWellbeingSummaryResponseDto
            {
                RiskLevel = input.RiskLevel,
                HighestRiskDepartment = input.HighestRiskDepartment,
                Summary = summary ?? "",
                Recommendations = recommendations
            };
        }
        catch
        {
            return await _fallbackGenerator.GenerateAsync(input);
        }
    }

    private static string BuildPrompt(HrWellbeingSummaryAiInputDto input)
    {
        var departmentsText = string.Join(
            "\n",
            input.Departments.Select(dep =>
                $"- {dep.Department}: stress {dep.AverageStress:F1}/10, energy {dep.AverageEnergy:F1}/10, high stress {dep.HighStressPercentage:F1}%"));

        return $$"""
You are an AI organizational wellbeing assistant for HR teams.

Analyze the organization wellbeing data and return ONLY valid JSON.

Company data:
- Total check-ins: {{input.TotalCheckIns}}
- Average stress: {{input.AverageStress:F1}}/10
- Average energy: {{input.AverageEnergy:F1}}/10
- High stress count: {{input.HighStressCount}}
- Overall risk level: {{input.RiskLevel}}
- Highest risk department: {{input.HighestRiskDepartment}}

Departments:
{{departmentsText}}

Requirements:
- Professional HR tone
- Non-medical language
- Organization-level only
- No personal/employee-specific advice
- Concise insights

Return JSON ONLY in this format:

{
  "summary": "short HR wellbeing summary",
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}
""";
    }
}