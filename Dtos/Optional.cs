using System.Text.Json;
using System.Text.Json.Serialization;

namespace Hatsu.Dtos;

[JsonConverter(typeof(OptionalJsonConverterFactory))]
public readonly struct Optional<T>
{
    public bool IsSpecified { get; }
    public T Value { get; }

    public Optional(T pValue)
    {
        Value = pValue;
        IsSpecified = true;
    }
}

public class OptionalJsonConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type pTypeToConvert)
    {
        var xReturn = pTypeToConvert.IsGenericType
            && pTypeToConvert.GetGenericTypeDefinition() == typeof(Optional<>);
        return xReturn;
    }

    public override JsonConverter CreateConverter(Type pTypeToConvert, JsonSerializerOptions pOptions)
    {
        var xValueType = pTypeToConvert.GetGenericArguments()[0];
        var xConverterType = typeof(OptionalJsonConverter<>).MakeGenericType(xValueType);
        var xReturn = (JsonConverter)Activator.CreateInstance(xConverterType)!;
        return xReturn;
    }
}

public class OptionalJsonConverter<T> : JsonConverter<Optional<T>>
{
    public override Optional<T> Read(ref Utf8JsonReader pReader, Type pTypeToConvert, JsonSerializerOptions pOptions)
    {
        var xValue = JsonSerializer.Deserialize<T>(ref pReader, pOptions);
        var xReturn = new Optional<T>(xValue!);
        return xReturn;
    }

    public override void Write(Utf8JsonWriter pWriter, Optional<T> pValue, JsonSerializerOptions pOptions)
    {
        JsonSerializer.Serialize(pWriter, pValue.Value, pOptions);
    }
}
