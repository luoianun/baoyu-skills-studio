def test_register(client):
    r = client.post("/api/auth/register", json={"email":"a@b.com","username":"alice","password":"pass123"})
    assert r.status_code == 200
    assert r.json()["access_token"]

def test_register_duplicate(client):
    client.post("/api/auth/register", json={"email":"a@b.com","username":"alice","password":"pass123"})
    r = client.post("/api/auth/register", json={"email":"a@b.com","username":"alice2","password":"pass123"})
    assert r.status_code == 409

def test_login(client):
    client.post("/api/auth/register", json={"email":"a@b.com","username":"alice","password":"pass123"})
    r = client.post("/api/auth/login", json={"email":"a@b.com","password":"pass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_me(client):
    r = client.post("/api/auth/register", json={"email":"a@b.com","username":"alice","password":"pass123"})
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["email"] == "a@b.com"
    assert me.json()["credits"] == 0

def test_refresh(client):
    r = client.post("/api/auth/register", json={"email":"a@b.com","username":"alice","password":"pass123"})
    refresh_token = r.json()["refresh_token"]
    r2 = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert r2.status_code == 200
    assert r2.json()["access_token"]
    # old refresh token should be revoked
    r3 = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert r3.status_code == 401

def test_logout(client):
    r = client.post("/api/auth/register", json={"email":"a@b.com","username":"alice","password":"pass123"})
    refresh_token = r.json()["refresh_token"]
    client.post("/api/auth/logout", json={"refresh_token": refresh_token})
    # after logout, refresh token should be rejected
    r2 = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert r2.status_code == 401
