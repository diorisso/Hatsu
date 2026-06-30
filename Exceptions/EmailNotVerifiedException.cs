namespace Hatsu.Exceptions;

public class EmailNotVerifiedException : Exception
{
    public EmailNotVerifiedException(string pMessage) : base(pMessage) { }
}
