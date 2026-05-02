# FundWisor Workflow Guide

## 🔄 Complete User Flow

### Phase 1: User Registration & KYC Verification

#### Entrepreneur Registration Flow
1. **Register** → Provide email, password, full name, company name
2. **Email Verification** → Confirm email address
3. **KYC Verification** → Submit identity documents
4. **Await Approval** → Admin reviews KYC
5. **Dashboard Access** → Once verified, can create startups

#### Investor Registration Flow
1. **Register** → Provide email, password, full name, company/fund name
2. **Email Verification** → Confirm email address
3. **KYC Verification** → Submit identity documents
4. **Profile Setup** → Complete investment preferences
5. **Browse Access** → Once verified, can browse startup teasers

#### Admin Registration
- Created by system administrator
- Direct access to admin panel
- No KYC requirement

---

### Phase 2: Startup Creation (Entrepreneur)

#### Step 1: Create Startup Listing
**POST /api/entrepreneur/startups**
- Basic Info: Name, tagline, sector, stage
- Problem & Solution: Market opportunity details
- Funding: Ask amount, equity offer
- Visibility: Default is "teaser" (public info only)

**Teaser Content** (Public):
- Company name and tagline
- Problem statement
- Sector and funding stage
- Funding ask
- Company website

#### Step 2: Submit for Admin Approval
**POST /api/entrepreneur/startups/:id/submit**
- Startup status changes to "pending"
- Admin receives notification
- Entrepreneur can still edit while pending

#### Step 3: Admin Review & Approval
**POST /api/admin/startups/:id/approve**
- Admin verifies information
- Checks for compliance
- Approves or rejects with reason
- Approval triggers notification to entrepreneur

#### Step 4: Publish Full Details
**POST /api/entrepreneur/startups/:id/publish-details**
Once approved, entrepreneur can upload:
- Detailed market analysis
- Financial metrics
- Team information
- Technology stack
- Competitor analysis
- Growth metrics

These details remain **HIDDEN** until investor is granted access.

---

### Phase 3: Access Request (Investor Perspective)

#### Step 1: Browse Startup Teasers
**GET /api/investor/startups**
- Returns list of approved startups
- Only shows public teaser information
- Includes view count, access request count
- Filtered by sector, funding ask, stage

#### Step 2: Request Access
**POST /api/investor/access-requests**
Payload:
```json
{
  "startup_id": 123,
  "message": "We are interested in investing",
  "investment_range": "$500K - $2M"
}
```
- Access request created with status "pending"
- Entrepreneur receives notification
- Investor can view request status

#### Step 3: Sign NDA
**POST /api/investor/access-requests/:id/sign-nda**
- Investor confirms NDA terms
- Records timestamp and IP address
- NDA status updates to "signed"
- Required before access can be granted

#### Step 4: Pay Seriousness Deposit
**POST /api/investor/access-requests/:id/pay-deposit**
Payload:
```json
{
  "amount": 5000,
  "currency": "USD",
  "payment_method": "card"
}
```
- Creates transaction record
- Initiates payment gateway (Razorpay mock)
- Deposit is refundable
- Records payment date and status

---

### Phase 4: Access Approval (Entrepreneur)

#### Step 1: Review Access Request
**GET /api/entrepreneur/access-requests/:id**
- View investor details
- Check investor reliability score
- See investment capacity
- Review request message

#### Step 2: Approve or Reject
**POST /api/entrepreneur/access-requests/:id/approve** OR **reject**

Approve:
- Status changes to "approved"
- Notification sent to investor
- Access expires in 30 days (configurable)
- Investor can now view full details

Reject:
- Status changes to "rejected"
- Optional rejection reason
- Notification sent to investor
- Investor deposit is refunded automatically

---

### Phase 5: Secure Document Access

#### Step 1: Entrepreneur Upload Documents
**POST /api/entrepreneur/startups/:id/documents**
Payload:
```json
{
  "title": "Pitch Deck Q2 2026",
  "description": "Updated pitch deck with financials",
  "file_url": "s3://bucket/pitch.pdf",
  "document_type": "pitch-deck",
  "is_public": false
}
```
- Stored in AWS S3 (or mock)
- Associated with specific startup
- Access controlled via access_requests

#### Step 2: Investor Access Documents
**GET /api/investor/documents/:id**
Access Conditions:
1. Approved access request exists
2. NDA is signed
3. Deposit is paid
4. Access not expired

Document View:
- Watermark overlay with investor user ID
- Document access logged
- View duration tracked
- Pages viewed recorded
- Cannot be downloaded (view-only)

#### Step 3: Document Access Logging
**Automatic on every view:**
- Document ID
- Investor ID
- Access request ID
- Timestamp
- IP address
- User agent
- Duration
- Watermark status

**Audit Trail Available to Entrepreneur:**
**GET /api/entrepreneur/startups/:id/access-logs**
- See who accessed what document
- When and for how long
- From which IP address

---

### Phase 6: Investor Reliability Score

#### Score Calculation
```
Reliability Score = (0.3 × Activity Score) + (0.4 × Response Score) + (0.3 × KYC Score)
```

Activity Score:
- Number of approved access requests
- Number of successful deposits
- Follow-up engagement

Response Score:
- Average response time to communications
- Completion of all required steps

KYC Score:
- If KYC verified: +0.5
- If KYC pending: 0

#### Score Updates
- Updated after each significant action
- Visible to entrepreneurs
- Used for filtering investor requests
- Increases investor credibility

---

### Phase 7: Admin Panel Functions

#### Startup Management
**GET /api/admin/startups/pending**
- Review pending startup submissions
- Verify information accuracy
- Check for red flags

**POST /api/admin/startups/:id/approve**
**POST /api/admin/startups/:id/reject**
- Approve or reject with reason
- Archived listings visible

#### User Management
**GET /api/admin/users**
- Filter by role, KYC status, activity
- Monitor suspicious accounts
- Update user status

#### Transaction Monitoring
**GET /api/admin/transactions**
- View all deposit transactions
- Monitor refunds
- Detect fraud patterns

#### Analytics Dashboard
**GET /api/admin/analytics**
- Active users by role
- Startups by sector
- Average deposit amount
- Success rate of access requests
- Most viewed startups
- Most active investors

#### Audit Logs
**GET /api/admin/audit-logs**
- All system actions logged
- Filter by user, action, entity
- Date range filtering

---

## 🔐 Security Measures

### Authentication & Authorization
- JWT tokens with 24-hour expiry
- Refresh token mechanism (7 days)
- Role-based access control (RBAC)
- IP address logging

### Data Protection
- Passwords hashed with bcrypt (10 rounds)
- HTTPS only in production
- CORS enabled for frontend domains
- SQL injection prevention via parameterized queries

### Access Control
- Multi-layer visibility enforcement
- NDA requirement before document access
- Deposit payment verification
- Time-limited access windows
- Automatic access expiration

### Audit Trail
- All actions logged to audit_logs
- IP address and user agent recorded
- Document access logged separately
- Admin can query complete action history

---

## 📊 Notification System

### Email Notifications
Triggered for:
- Account registration confirmation
- KYC verification status
- Startup approval/rejection
- Access request received
- Access approved/rejected
- Deposit payment confirmation
- Document access by investor
- Access about to expire (7 days warning)

### In-App Notifications
- Real-time updates in notification bell
- Unread count
- Notification history
- Notification preferences (user can disable)

---

## ⏰ Time Windows

- **NDA Expiry**: 2 years from signing
- **Deposit Refund Window**: 30 days from rejection
- **Document Access Duration**: 30 days (configurable)
- **Access Expiry Warning**: 7 days before expiration
- **JWT Token**: 24 hours
- **Refresh Token**: 7 days

---

## 📈 Analytics Available

### For Entrepreneurs
- Teaser views count
- Access requests received (by status)
- Most engaged investors
- Document access analytics
- Investor reliability scores of requesters

### For Investors
- Approved access count
- Deposits made
- Current access documents
- Investor reliability score
- Activity timeline

### For Admins
- Total users by role
- KYC verification rate
- Startup submission rate
- Approval/rejection rate
- Average deposit amount
- Most popular sectors
- Transaction success rate
