using EmployeeWellbeingPlatform.Application.HR.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Application.Services;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EmployeeWellbeingPlatform.Infrastructure.Services;

public class HrReportPdfService : IHrReportPdfService
{
    private readonly HRService _hrService;

    public HrReportPdfService(HRService hrService)
    {
        _hrService = hrService;
    }

    public async Task<byte[]> GenerateDashboardReportAsync(int days)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        if (days <= 0)
        {
            days = 30;
        }

        var dashboard = await _hrService.GetDashboardAsync(days);
        var periodLabel = days == 180 ? "Last 6 months" : $"Last {days} days";

        return GeneratePdf(dashboard, periodLabel);
    }

    public async Task<byte[]> GenerateDashboardReportAsync(DateTime startDate, DateTime endDate)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        if (endDate <= startDate)
        {
            endDate = startDate.AddDays(1);
        }

        var dashboard = await _hrService.GetDashboardAsync(startDate, endDate);
        var periodLabel = $"{startDate:dd MMM yyyy} - {endDate:dd MMM yyyy}";

        return GeneratePdf(dashboard, periodLabel);
    }

    private static byte[] GeneratePdf(HRDashboardResponseDto dashboard, string periodLabel)
    {
        var generatedAt = DateTime.UtcNow;

        var highestRiskDepartment = dashboard.Departments
            .OrderByDescending(department => department.RiskScore)
            .FirstOrDefault();

        var moodHealthScore = CalculateMoodHealthScore(dashboard.MoodDistribution);
        var moodHealthLevel = GetMoodHealthLevel(moodHealthScore);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Column(column =>
                    {
                        column.Item().Text("HR Wellbeing Report")
                            .FontSize(24)
                            .Bold()
                            .FontColor(Colors.Green.Darken2);

                        column.Item().Text(periodLabel)
                            .FontSize(12)
                            .FontColor(Colors.Grey.Darken1);

                        column.Item().Text($"Generated on {generatedAt:dd MMM yyyy, HH:mm} UTC")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });

                page.Content()
                    .PaddingVertical(25)
                    .Column(column =>
                    {
                        column.Spacing(18);

                        column.Item().Text("Executive Summary")
                            .FontSize(16)
                            .Bold();

                        column.Item().Text(BuildExecutiveSummary(
                            dashboard,
                            highestRiskDepartment,
                            moodHealthScore,
                            moodHealthLevel));

                        column.Item().Text("Company Overview")
                            .FontSize(16)
                            .Bold();

                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            AddMetricRow(table, "Total Check-ins", dashboard.TotalCheckIns.ToString());
                            AddMetricRow(table, "Average Stress", $"{dashboard.AverageStress:0.0}/10");
                            AddMetricRow(table, "Average Energy", $"{dashboard.AverageEnergy:0.0}/10");
                            AddMetricRow(table, "High Stress Alerts", dashboard.HighStressCount.ToString());
                            AddMetricRow(table, "Mood Health Score", $"{moodHealthScore}/100 ({moodHealthLevel})");
                        });

                        column.Item().Text("Highest Risk Department")
                            .FontSize(16)
                            .Bold();

                        if (highestRiskDepartment != null)
                        {
                            column.Item().Text(
                                $"{highestRiskDepartment.Department} - Risk Score {highestRiskDepartment.RiskScore:0.0}/100 ({highestRiskDepartment.RiskLevel})"
                            );
                        }
                        else
                        {
                            column.Item().Text("No department data available for this period.");
                        }

                        column.Item().Text("Mood Distribution")
                            .FontSize(16)
                            .Bold();

                        if (dashboard.MoodDistribution.Any())
                        {
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                AddHeaderCell(table, "Mood");
                                AddHeaderCell(table, "Check-ins");
                                AddHeaderCell(table, "Percentage");

                                foreach (var mood in dashboard.MoodDistribution)
                                {
                                    AddCell(table, mood.Mood);
                                    AddCell(table, mood.Count.ToString());
                                    AddCell(table, $"{mood.Percentage:0.0}%");
                                }
                            });
                        }
                        else
                        {
                            column.Item().Text("No mood data available for this period.");
                        }

                        column.Item().Text("Department Breakdown")
                            .FontSize(16)
                            .Bold();

                        if (dashboard.Departments.Any())
                        {
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(1.4f);
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn(1.4f);
                                });

                                AddHeaderCell(table, "Department");
                                AddHeaderCell(table, "Check-ins");
                                AddHeaderCell(table, "Stress");
                                AddHeaderCell(table, "Energy");
                                AddHeaderCell(table, "Risk");

                                foreach (var department in dashboard.Departments
                                             .OrderByDescending(department => department.RiskScore))
                                {
                                    AddCell(table, department.Department);
                                    AddCell(table, department.TotalCheckIns.ToString());
                                    AddCell(table, department.AverageStress.ToString("0.0"));
                                    AddCell(table, department.AverageEnergy.ToString("0.0"));
                                    AddCell(table, $"{department.RiskScore:0.0} ({department.RiskLevel})");
                                }
                            });
                        }
                        else
                        {
                            column.Item().Text("No department data available for this period.");
                        }

                        column.Item().Text("Notes")
                            .FontSize(16)
                            .Bold();

                        column.Item().Text(
                            "This report is generated from aggregated wellbeing check-ins. It is intended for HR analysis, leadership reporting, and wellbeing trend monitoring. Individual employee notes are not included."
                        ).FontColor(Colors.Grey.Darken1);
                    });

                page.Footer()
                    .AlignCenter()
                    .Text("Generated by Employee Wellbeing Platform")
                    .FontSize(9)
                    .FontColor(Colors.Grey.Darken1);
            });
        }).GeneratePdf();
    }

    private static string BuildExecutiveSummary(
        HRDashboardResponseDto dashboard,
        DepartmentWellbeingSummaryDto? highestRiskDepartment,
        int moodHealthScore,
        string moodHealthLevel)
    {
        if (dashboard.TotalCheckIns == 0)
        {
            return "There is not enough wellbeing data for the selected period. Encourage employees to complete regular check-ins before drawing organizational conclusions.";
        }

        var highestRiskText = highestRiskDepartment != null
            ? $"The highest risk department is {highestRiskDepartment.Department}, with a risk score of {highestRiskDepartment.RiskScore:0.0}/100 ({highestRiskDepartment.RiskLevel})."
            : "No department risk data is available.";

        return
            $"During this period, employees completed {dashboard.TotalCheckIns} check-ins. " +
            $"The average stress level was {dashboard.AverageStress:0.0}/10 and the average energy level was {dashboard.AverageEnergy:0.0}/10. " +
            $"There were {dashboard.HighStressCount} high-stress check-ins. " +
            $"The mood health score is {moodHealthScore}/100 ({moodHealthLevel}). " +
            highestRiskText;
    }

    private static int CalculateMoodHealthScore(List<MoodDistributionDto> moods)
    {
        var totalCount = moods.Sum(item => item.Count);

        if (totalCount == 0)
        {
            return 0;
        }

        var weightedScore = moods.Sum(item => GetMoodWeight(item.Mood) * item.Count);

        var minScore = -2 * totalCount;
        var maxScore = 2 * totalCount;

        return (int)Math.Round(((weightedScore - minScore) / (double)(maxScore - minScore)) * 100);
    }

    private static int GetMoodWeight(string mood)
    {
        return mood switch
        {
            "Happy" => 2,
            "Neutral" => 1,
            "Tired" => -1,
            "Stressed" => -2,
            "Anxious" => -2,
            _ => 0
        };
    }

    private static string GetMoodHealthLevel(int score)
    {
        if (score >= 75)
        {
            return "Strong";
        }

        if (score >= 55)
        {
            return "Moderate";
        }

        if (score >= 35)
        {
            return "At risk";
        }

        return "Critical";
    }

    private static void AddMetricRow(TableDescriptor table, string label, string value)
    {
        AddCell(table, label);
        AddCell(table, value);
    }

    private static void AddHeaderCell(TableDescriptor table, string text)
    {
        table.Cell()
            .Background(Colors.Green.Lighten4)
            .Padding(6)
            .Text(text)
            .Bold();
    }

    private static void AddCell(TableDescriptor table, string text)
    {
        table.Cell()
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(6)
            .Text(text);
    }
}