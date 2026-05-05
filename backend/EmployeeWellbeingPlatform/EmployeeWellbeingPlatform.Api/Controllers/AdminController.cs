using EmployeeWellbeingPlatform.Application.Admin.Dtos;
using EmployeeWellbeingPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeWellbeingPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AdminService _adminService;

    public AdminController(AdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, UpdateUserRoleDto dto)
    {
        var result = await _adminService.UpdateRoleAsync(id, dto.Role);

        if (!result)
        {
            return BadRequest("Invalid role or user not found");
        }

        return Ok("Role updated");
    }

    [HttpPut("users/{id}/department")]
    public async Task<IActionResult> UpdateDepartment(Guid id, UpdateUserDepartmentDto dto)
    {
        var result = await _adminService.UpdateDepartmentAsync(id, dto.DepartmentId);

        if (!result)
        {
            return BadRequest("Invalid user or department");
        }

        return Ok("Department updated");
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _adminService.GetDepartmentsAsync();

        return Ok(departments);
    }

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment(CreateDepartmentDto dto)
    {
        var result = await _adminService.CreateDepartmentAsync(dto.Name);

        if (!result)
        {
            return BadRequest("Invalid department name or department already exists");
        }

        return Ok("Department created");
    }
}