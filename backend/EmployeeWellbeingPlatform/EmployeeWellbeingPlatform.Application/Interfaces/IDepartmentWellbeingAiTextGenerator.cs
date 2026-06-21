using EmployeeWellbeingPlatform.Application.Ai.Dtos;

namespace EmployeeWellbeingPlatform.Application.Ai;

public interface IDepartmentWellbeingAiTextGenerator
{
    Task<DepartmentWellbeingInsightResponseDto> GenerateAsync(
        DepartmentWellbeingInsightAiInputDto input);
}