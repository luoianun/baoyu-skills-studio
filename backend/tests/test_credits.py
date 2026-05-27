def test_deduct_credits(client):
    r = client.post("/api/auth/register", json={"email":"u@b.com","username":"u","password":"p"})
    token = r.json()["access_token"]
    # new user has 0 credits — generate endpoint should return 402
    r2 = client.post("/api/generate/cover-image",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "test"})
    assert r2.status_code == 402

def test_admin_issue_credits(client, admin_token):
    r_user = client.post("/api/auth/register", json={"email":"u2@b.com","username":"u2","password":"p"})
    access_token = r_user.json()["access_token"]
    user_id = client.get("/api/auth/me", headers={"Authorization": f"Bearer {access_token}"}).json()["id"]
    r = client.post(f"/api/admin/users/{user_id}/credits",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"amount": 10, "note": "welcome credits"})
    assert r.status_code == 200
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me.json()["credits"] == 10
