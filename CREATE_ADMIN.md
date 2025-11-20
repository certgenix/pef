# Create Admin User - 2 Minute Guide

## Step 1: Create the Auth Account (You do this - 1 minute)

1. **Go to**: https://console.firebase.google.com/
2. **Select project**: `pef-web`
3. **Click**: Authentication → Users → **Add User**
4. **Enter**:
   - Email: `admin@pef.com`
   - Password: (choose any password - remember it!)
5. **Click**: Add User
6. **COPY the UID** - it looks like: `xYz123AbC456` (you'll see it in the list)

## Step 2: Run This Command (Paste the UID)

```bash
ADMIN_UID=paste-your-uid-here npm run setup-admin
```

**Example:**
```bash
ADMIN_UID=xYz123AbC456 npm run setup-admin
```

## Step 3: Done! Login

- Email: `admin@pef.com`
- Password: (the one you chose)
- Go to: `/admin`

---

## Alternative: I'll Create It Manually

If you want, just:
1. Tell me the UID after you create the auth user
2. I'll run the command for you

That's it!
