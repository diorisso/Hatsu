using Hatsu.Dtos;
using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface ITokenService
{
    AuthResponse GenerateToken(User pUser);
}
