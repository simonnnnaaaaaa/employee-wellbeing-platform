using EmployeeWellbeingPlatform.Application.Ai.Dtos;

namespace EmployeeWellbeingPlatform.Application.Ai;

public interface IWellbeingAiTextGenerator
{
    Task<WellbeingInsightResponseDto> GenerateAsync(WellbeingInsightAiInputDto input);
}