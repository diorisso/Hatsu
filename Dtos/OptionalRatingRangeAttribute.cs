using System.ComponentModel.DataAnnotations;

namespace Hatsu.Dtos;

public class OptionalRatingRangeAttribute : ValidationAttribute
{
    private readonly int _min;
    private readonly int _max;

    public OptionalRatingRangeAttribute(int pMin, int pMax)
    {
        _min = pMin;
        _max = pMax;
    }

    protected override ValidationResult? IsValid(object? pValue, ValidationContext pContext)
    {
        if (pValue is Optional<byte?> xOptional && xOptional.IsSpecified && xOptional.Value.HasValue)
        {
            var xRating = xOptional.Value.Value;
            if (xRating < _min || xRating > _max)
            {
                var xReturn = new ValidationResult($"Rating must be between {_min} and {_max}.");
                return xReturn;
            }
        }

        return ValidationResult.Success;
    }
}
