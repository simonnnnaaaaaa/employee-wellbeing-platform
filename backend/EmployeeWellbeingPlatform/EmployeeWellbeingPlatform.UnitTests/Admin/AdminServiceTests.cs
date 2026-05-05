using EmployeeWellbeingPlatform.Application.Admin.Dtos;
using EmployeeWellbeingPlatform.Application.Services;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
using Moq;

namespace EmployeeWellbeingPlatform.UnitTests.Admin;

public class AdminServiceTests
{
    private readonly Mock<IAdminRepository> _adminRepositoryMock;
    private readonly Mock<IDepartmentRepository> _departmentRepositoryMock;
    private readonly AdminService _adminService;

    public AdminServiceTests()
    {
        _adminRepositoryMock = new Mock<IAdminRepository>();
        _departmentRepositoryMock = new Mock<IDepartmentRepository>();

        _adminService = new AdminService(
            _adminRepositoryMock.Object,
            _departmentRepositoryMock.Object
        );
    }

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnMappedUsers()
    {
        // Arrange
        var users = new List<User>
        {
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Ana",
                LastName = "Popescu",
                Email = "ana@test.com",
                Role = "Employee",
                Department = new Department { Name = "IT" }
            }
        };

        _adminRepositoryMock
            .Setup(r => r.GetAllUsersAsync())
            .ReturnsAsync(users);

        // Act
        var result = await _adminService.GetAllUsersAsync();

        // Assert
        Assert.Single(result);
        Assert.Equal("Ana", result[0].FirstName);
        Assert.Equal("IT", result[0].Department);
    }

    [Fact]
    public async Task UpdateRoleAsync_WithValidRole_ShouldUpdateRole()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Role = "Employee"
        };

        _adminRepositoryMock
            .Setup(r => r.GetByIdAsync(user.Id))
            .ReturnsAsync(user);

        // Act
        var result = await _adminService.UpdateRoleAsync(user.Id, "HR");

        // Assert
        Assert.True(result);
        Assert.Equal("HR", user.Role);
        _adminRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateRoleAsync_WithInvalidRole_ShouldReturnFalse()
    {
        // Act
        var result = await _adminService.UpdateRoleAsync(Guid.NewGuid(), "InvalidRole");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateRoleAsync_UserNotFound_ShouldReturnFalse()
    {
        // Arrange
        _adminRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _adminService.UpdateRoleAsync(Guid.NewGuid(), "HR");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UpdateDepartmentAsync_ShouldUpdateDepartmentId()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            DepartmentId = null
        };

        var departmentId = Guid.NewGuid();

        _adminRepositoryMock
            .Setup(r => r.GetByIdAsync(user.Id))
            .ReturnsAsync(user);

        // Act
        var result = await _adminService.UpdateDepartmentAsync(user.Id, departmentId);

        // Assert
        Assert.True(result);
        Assert.Equal(departmentId, user.DepartmentId);
        _adminRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateDepartmentAsync_UserNotFound_ShouldReturnFalse()
    {
        // Arrange
        _adminRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _adminService.UpdateDepartmentAsync(Guid.NewGuid(), Guid.NewGuid());

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CreateDepartmentAsync_ValidName_ShouldCreateDepartment()
    {
        // Arrange
        _departmentRepositoryMock
            .Setup(r => r.ExistsByNameAsync("IT"))
            .ReturnsAsync(false);

        // Act
        var result = await _adminService.CreateDepartmentAsync("IT");

        // Assert
        Assert.True(result);
        _departmentRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Department>()), Times.Once);
    }

    [Fact]
    public async Task CreateDepartmentAsync_DuplicateName_ShouldReturnFalse()
    {
        // Arrange
        _departmentRepositoryMock
            .Setup(r => r.ExistsByNameAsync("IT"))
            .ReturnsAsync(true);

        // Act
        var result = await _adminService.CreateDepartmentAsync("IT");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CreateDepartmentAsync_EmptyName_ShouldReturnFalse()
    {
        // Act
        var result = await _adminService.CreateDepartmentAsync("");

        // Assert
        Assert.False(result);
    }
}