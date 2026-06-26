using Hatsu.Dtos;

namespace Hatsu.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest pRequest);
    Task<AuthResponse> LoginAsync(LoginRequest pRequest);
}
