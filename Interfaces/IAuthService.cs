using Hatsu.Dtos;

namespace Hatsu.Interfaces;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest pRequest);
    Task<AuthResponse> LoginAsync(LoginRequest pRequest);
    Task<AuthResponse> VerifyEmailAsync(string pToken);
    Task ResendVerificationAsync(ResendVerificationRequest pRequest);
}
