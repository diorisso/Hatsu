namespace Hatsu.Interfaces;

public interface IStorageService
{
    Task UploadAsync(Stream pContent, string pKey, string pContentType);
    Task DeleteAsync(string pKey);
}
