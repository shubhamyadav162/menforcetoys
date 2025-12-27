
import http.client
import json

def get_supabase_keys(project_ref, access_token):
    conn = http.client.HTTPSConnection("api.supabase.com")
    headers = {
        'Authorization': f"Bearer {access_token}"
    }
    
    print(f"Fetching API keys for project: {project_ref}...")
    conn.request("GET", f"/v1/projects/{project_ref}/api-keys", headers=headers)
    res = conn.getresponse()
    data = res.read()
    
    if res.status == 200:
        keys = json.loads(data.decode("utf-8"))
        print("✅ Successfully fetched keys!")
        for key in keys:
            print(f"Name: {key['name']}, API Key: {key['api_key']}")
        return keys
    else:
        print(f"❌ Failed to fetch keys. Status: {res.status}")
        print(data.decode("utf-8"))
        return None

if __name__ == "__main__":
    PROJECT_REF = "qnvdzuiimikcrgpjfier"
    ACCESS_TOKEN = "sbp_11c9e6d5749ffb6ee03fdfbd071c25ebec2308d6"
    get_supabase_keys(PROJECT_REF, ACCESS_TOKEN)
