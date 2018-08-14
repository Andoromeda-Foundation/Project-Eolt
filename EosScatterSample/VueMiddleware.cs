using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace EosScatterSample
{
    public class VueMiddleware
    {
        private readonly RequestDelegate _next;

        public VueMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext httpContext)
        {
            return httpContext.Response.WriteAsync(File.ReadAllText(Path.Combine("wwwroot", "index.html")));
        }
    }

    public static class VueMiddlewareExtensions
    {
        public static IApplicationBuilder UseVueMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<VueMiddleware>();
        }
    }
}
