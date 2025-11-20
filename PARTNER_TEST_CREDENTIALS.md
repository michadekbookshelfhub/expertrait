# 🧪 Test Partner Login Credentials

## Current Issue
The partner system has been implemented, but there's a status synchronization issue between the database and the backend API. The partner account exists with "approved" status in MongoDB, but the backend is reading it as "pending".

## Test Credentials (Manual Setup Required)

### Option 1: Register New Partner (Recommended)

Since the partner registration API has an email sending issue, use the mobile app or web to register:

**Navigate to:** Partner Registration Screen

**Fill in these details:**
```
Representative Details:
- Full Name: John Smith  
- Phone: +44 20 1234 5678
- Address: 45 Park Lane, London, W1K 1PN, UK
- Job Role: Healthcare Manager

Account Details:
- Email: partner@test.com
- Password: Partner123!

Company Details:
- Organization Name: Test Healthcare Company
- Company Address: 100 Healthcare St, London, EC1A 1BB, UK
- License Number: HC-UK-2024-001
- Healthcare Category: Domiciliary Care Worker
```

**Then:** An admin needs to approve the partner from the Admin Dashboard at `/admin` under Partners section.

---

### Option 2: Existing Partner (Needs Fix)

There's already a partner created in the database:

**Email:** test.partner@expertrait.com  
**Password:** Partner123!  
**Status:** Should be "approved" but backend reads "pending"

**Issue:** Database-Backend sync problem. Status shows "approved" in MongoDB but "pending" in API response.

---

## Healthcare Categories Available

When registering a partner, choose from:
- Baby Sitter
- Dog Sitter
- Mental Support Worker
- Domiciliary Care Worker
- Support Worker (Sit-in)

---

## Partner Login Flow

1. **Register** via mobile app partner registration screen
2. **Wait for approval** - Admin approves from web dashboard
3. **Login** via partner login endpoint
4. **Access dashboard** - View assigned handlers, bookings, stats

---

## Admin Approval Process

To approve a partner (as admin):

1. Login to Admin Dashboard (web)
2. Navigate to Partners section
3. Find the pending partner
4. Click "Approve"
5. Partner will receive email notification

---

## API Endpoints

**Register Partner:**
```
POST /api/partner/register
Body: {all registration fields}
```

**Partner Login:**
```
POST /api/partner/login
Body: {
  "email": "partner@test.com",
  "password": "Partner123!"
}
```

**Get Partner Handlers:**
```
GET /api/partner/{partner_id}/handlers
```

**Get Partner Bookings:**
```
GET /api/partner/{partner_id}/bookings
```

---

## Troubleshooting

### "Partner account is pending"
- Partner needs admin approval
- Check admin dashboard to approve

### "Invalid credentials"
- Check email/password are correct
- Password must match exactly (case-sensitive)

### "Partner with this email already exists"
- Partner already registered
- Use different email or login with existing account

---

## Quick Fix for Existing Partner

If you want to use the existing test partner immediately, run this command to fix the status issue:

```bash
# Delete and recreate the partner with correct status
mongosh "mongodb://localhost:27017/oscar_home_services" --eval "
db.partners.deleteMany({email: 'test.partner@expertrait.com'});
db.partners.insertOne({
  representative_full_name: 'John Smith',
  representative_phone: '+44 20 1234 5678',
  representative_address: '45 Park Lane, London, UK',
  representative_job_role: 'Healthcare Manager',
  email: 'test.partner@expertrait.com',
  password: '\$2b\$12\$XpTtj7AgBoLbZ73qlQg0zO39DYkVPz.cCZIbJM9oC7z6704EDxbIO',
  organization_name: 'Test Healthcare Partners',
  company_address: '100 Healthcare Street, London, UK',
  license_number: 'HC-UK-2024-001',
  healthcare_category: 'Domiciliary Care Worker',
  status: 'approved',
  handler_count: 0,
  created_at: new Date()
});
"

# Restart backend to clear any caches
sudo supervisorctl restart backend
```

Then try logging in again with:
- Email: test.partner@expertrait.com
- Password: Partner123!

---

## Mobile App Partner Dashboard

Once logged in as a partner, you'll have access to:

- **Dashboard Tab**: Overview stats, handler count, bookings
- **Workers Tab**: List of assigned healthcare handlers  
- **Profile Tab**: Partner company information

Navigate using the bottom tab bar in the mobile app.
