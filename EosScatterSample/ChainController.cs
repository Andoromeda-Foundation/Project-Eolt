using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace EosScatterSample
{
    [Route("api/[controller]")]
    public class ChainController : Controller
    {
        [HttpGet("id")]
        public async Task<object> GetChain()
        {
            using (var client = new HttpClient() { BaseAddress = new Uri("http://localhost:8888") })
            using (var resposne = await client.GetAsync("/v1/chain/get_info"))
            {
                var jsonText = await resposne.Content.ReadAsStringAsync();
                var dic = JsonConvert.DeserializeObject<Dictionary<string, object>>(jsonText);
                return new
                {
                    code = 200,
                    data = dic["chain_id"]
                };
            }
        }

        [HttpGet("account/{account}/perm/{perm}")]
        public async Task<object> GetAccount(string account, string perm)
        {
            using (var client = new HttpClient() { BaseAddress = new Uri("http://localhost:8888") })
            using (var resposne = await client.PostAsync("/v1/chain/get_account", 
                new StringContent(JsonConvert.SerializeObject(new { account_name = account }), System.Text.Encoding.UTF8, "application/json")))
            {
                var jsonText = await resposne.Content.ReadAsStringAsync();
                var res = JsonConvert.DeserializeObject<GetAccountResponse>(jsonText);
                return new
                {
                    code = 200,
                    data = res.permissions.Single(x => x.perm_name == perm).required_auth.keys.First().key
                };
            }
        }

        private class GetAccountResponse
        {
            public IEnumerable<Permission> permissions { get; set; }
        }

        private class Permission
        {
            public string perm_name { get; set; }
            public RequiredAuth required_auth { get; set; }
        }

        private class RequiredAuth
        {
            public IEnumerable<Key> keys { get; set; } 
        }

        private class Key
        {
            public string key { get; set; }
        }
    }
}
