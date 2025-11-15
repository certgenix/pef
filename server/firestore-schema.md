# Firestore Collections Schema

## Collections for Business Owner Dashboard

### 1. `opportunities`
Stores business opportunities posted by business owners (investment/partnership opportunities)

```typescript
{
  id: string (auto-generated),
  userId: string,
  type: "investment" | "partnership",
  title: string,
  description: string,
  industry: string,
  location: string,
  investmentRange?: string,
  equityOffered?: string,
  partnershipType?: string,
  targetCountries: string[],
  status: "active" | "closed" | "pending",
  views: number,
  interested: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. `investors`
Stores investor profiles and their investment criteria

```typescript
{
  id: string (auto-generated),
  userId: string,
  name: string,
  focus: string[], // industries of interest
  investmentRange: string,
  investmentStage: string,
  location: string,
  portfolioSize: number,
  activeDeals: number,
  status: "active" | "inactive",
  createdAt: timestamp
}
```

### 3. `partnershipRequests`
Stores partnership requests and inquiries

```typescript
{
  id: string (auto-generated),
  fromUserId: string,
  toUserId: string,
  companyName: string,
  partnershipType: string,
  region: string,
  message: string,
  status: "pending" | "accepted" | "rejected",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. `activityLogs`
Tracks user activities for the dashboard

```typescript
{
  id: string (auto-generated),
  userId: string,
  action: string,
  description: string,
  metadata: object,
  createdAt: timestamp
}
```

### 5. `dashboardStats`
Stores aggregated statistics for business owner dashboards

```typescript
{
  id: string (userId),
  activeOpportunities: number,
  investorInterest: number,
  partnershipRequests: number,
  profileViews: number,
  profileViewsGrowth: string,
  lastUpdated: timestamp
}
```
