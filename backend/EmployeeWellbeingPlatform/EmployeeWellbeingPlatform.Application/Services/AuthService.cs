using EmployeeWellbeingPlatform.Application.Auth.Dtos;
using EmployeeWellbeingPlatform.Application.Interfaces;
using EmployeeWellbeingPlatform.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace EmployeeWellbeingPlatform.Application.Auth.Services;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> RegisterAsync(RegisterRequestDto request)
    {
        // verificăm dacă email-ul există deja
        var exists = await _userRepository.ExistsByEmailAsync(request.Email);
        if (exists)
        {
            return false;
        }

        // hash parola
        var passwordHash = HashPassword(request.Password);

        // creăm user
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = "Employee",
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        return true;
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }


    public AuthService(IUserRepository userRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
            return null;

        var passwordHash = HashPassword(request.Password);

        if (user.PasswordHash != passwordHash)
            return null;

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
    }
}