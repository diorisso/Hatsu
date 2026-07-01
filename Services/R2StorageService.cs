using Amazon.S3;
using Amazon.S3.Model;
using Hatsu.Interfaces;
using Hatsu.Settings;
using Microsoft.Extensions.Options;

namespace Hatsu.Services;

public class R2StorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly StorageSettings _settings;

    public R2StorageService(IAmazonS3 pS3, IOptions<StorageSettings> pSettings)
    {
        _s3 = pS3;
        _settings = pSettings.Value;
    }

    public async Task UploadAsync(Stream pContent, string pKey, string pContentType)
    {
        var xRequest = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = pKey,
            InputStream = pContent,
            ContentType = pContentType,
            DisablePayloadSigning = true
        };

        await _s3.PutObjectAsync(xRequest);
    }

    public async Task DeleteAsync(string pKey)
    {
        var xRequest = new DeleteObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = pKey
        };

        await _s3.DeleteObjectAsync(xRequest);
    }
}
