using EmployeeWellbeingPlatform.Application.Auth.Dtos;
using EmployeeWellbeingPlatform.Application.Auth.Services;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
using Moq;

namespace EmployeeWellbeingPlatform.UnitTests.Auth;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_WhenEmailDoesNotExist_ShouldCreateUserAndReturnTrue()
    {
        // Arrange
        var userRepositoryMock = new Mock<IUserRepository>();
        var jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        var request = new RegisterRequestDto
        {
            FirstName = "Ana",
            LastName = "Popescu",
            Email = "ana@test.com",
            Password = "123456"
        };

        userRepositoryMock
            .Setup(repo => repo.ExistsByEmailAsync(request.Email))
            .ReturnsAsync(false);

        var authService = new AuthService(
            userRepositoryMock.Object,
            jwtTokenGeneratorMock.Object
        );

        // Act
        var result = await authService.RegisterAsync(request);

        // Assert
        Assert.True(result);

        userRepositoryMock.Verify(
            repo => repo.AddAsync(It.Is<User>(user =>
                user.FirstName == request.FirstName &&
                user.LastName == request.LastName &&
                user.Email == request.Email &&
                user.Role == "Employee" &&
                !string.IsNullOrWhiteSpace(user.PasswordHash)
            )),
            Times.Once
        );
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailExists_ShouldReturnFalseAndNotCreateUser()
    {
        // Arrange
        var userRepositoryMock = new Mock<IUserRepository>();
        var jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        var request = new RegisterRequestDto
        {
            FirstName = "Ana",
            LastName = "Popescu",
            Email = "ana@test.com",
            Password = "123456"
        };

        userRepositoryMock
            .Setup(repo => repo.ExistsByEmailAsync(request.Email))
            .ReturnsAsync(true);

        var authService = new AuthService(
            userRepositoryMock.Object,
            jwtTokenGeneratorMock.Object
        );

        // Act
        var result = await authService.RegisterAsync(request);

        // Assert
        Assert.False(result);

        userRepositoryMock.Verify(
            repo => repo.AddAsync(It.IsAny<User>()),
            Times.Never
        );
    }


    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ShouldReturnLoginResponse()
    {
        // Arrange
        var userRepositoryMock = new Mock<IUserRepository>();
        var jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        var request = new LoginRequestDto
        {
            Email = "ana@test.com",
            Password = "123456"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ana",
            LastName = "Popescu",
            Email = request.Email,
            PasswordHash = "jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=",
            Role = "Employee",
            Department = new Department { Id = Guid.NewGuid(), Name = "General" },
            CreatedAt = DateTime.UtcNow
        };

        userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        jwtTokenGeneratorMock
            .Setup(generator => generator.GenerateToken(user))
            .Returns("fake-jwt-token");

        var authService = new AuthService(
            userRepositoryMock.Object,
            jwtTokenGeneratorMock.Object
        );

        // Act
        var result = await authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("fake-jwt-token", result.Token);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(user.Role, result.Role);
    }

    [Fact]
    public async Task LoginAsync_WhenEmailDoesNotExist_ShouldReturnNull()
    {
        // Arrange
        var userRepositoryMock = new Mock<IUserRepository>();
        var jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        var request = new LoginRequestDto
        {
            Email = "missing@test.com",
            Password = "123456"
        };

        userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        var authService = new AuthService(
            userRepositoryMock.Object,
            jwtTokenGeneratorMock.Object
        );

        // Act
        var result = await authService.LoginAsync(request);

        // Assert
        Assert.Null(result);

        jwtTokenGeneratorMock.Verify(
            generator => generator.GenerateToken(It.IsAny<User>()),
            Times.Never
        );
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordIsInvalid_ShouldReturnNull()
    {
        // Arrange
        var userRepositoryMock = new Mock<IUserRepository>();
        var jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();

        var request = new LoginRequestDto
        {
            Email = "ana@test.com",
            Password = "wrong-password"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Ana",
            LastName = "Popescu",
            Email = request.Email,
            PasswordHash = "jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=",
            Role = "Employee",
            Department = new Department { Id = Guid.NewGuid(), Name = "General" },
            CreatedAt = DateTime.UtcNow
        };

        userRepositoryMock
            .Setup(repo => repo.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        var authService = new AuthService(
            userRepositoryMock.Object,
            jwtTokenGeneratorMock.Object
        );

        // Act
        var result = await authService.LoginAsync(request);

        // Assert
        Assert.Null(result);

        jwtTokenGeneratorMock.Verify(
            generator => generator.GenerateToken(It.IsAny<User>()),
            Times.Never
        );
    }
}