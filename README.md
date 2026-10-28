# CeramicStore

Full-stack e-commerce storefront for a ceramic and tile shop.

Persian RTL customer experience, with owner/admin panels for catalog, orders, CMS content, and staff permissions.

## Stack

| Layer | Technology |
|-------|------------|
| API | ASP.NET Core, EF Core, PostgreSQL, JWT |
| Web | React, Vite, React Router |
| Auth | Phone OTP (register / login / password reset) |
| SMS | Console (dev) or Kavenegar (configurable) |

## Features

- Product catalog with search, sort, pagination, and box-coverage calculator
- Shopping cart and checkout with saved addresses
- Customer account area
- Admin product management
- Owner panel: orders, customers, reports, gallery, site CMS, staff permissions
- Editable storefront content (header, hero, contact, footer, buying guide, legal pages)
- Seed data for owner account and sample products

## Repository layout

```
CeramicStore/
├── CeramicStore.Api/     # Backend API
├── CeramicStore.Web/     # Frontend SPA
└── README.md
```

## Prerequisites

- .NET 10 SDK
- Node.js 20+
- PostgreSQL 14+

## Backend setup

```bash
cd CeramicStore.Api

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=CeramicStoreDb;Username=postgres;Password=YOUR_PASSWORD"
dotnet user-secrets set "Jwt:Key" "REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS"
dotnet user-secrets set "Seed:OwnerUsername" "owner"
dotnet user-secrets set "Seed:OwnerPassword" "ReplaceWithStrongPassword1!"

dotnet restore
dotnet ef database update
dotnet run --urls http://localhost:5158
```

On first run, the API creates the owner account from the seed secrets and loads sample products when the catalog is empty.

Optional SMS settings in `appsettings.json`:

```json
"Sms": {
  "Provider": "Console",
  "ApiKey": "",
  "Sender": "",
  "ExposeDevCode": true
}
```

## Frontend setup

```bash
cd CeramicStore.Web
cp .env.example .env
npm install
npm run dev
```

Default Vite URL: `http://localhost:5173`

Set `VITE_API_URL` in `.env` if the API is not at `http://localhost:5158`.

## Main routes

| Path | Description |
|------|-------------|
| `/` | Storefront |
| `/products/:id` | Product detail |
| `/cart`, `/checkout` | Cart and checkout |
| `/login`, `/register`, `/forgot-password` | Auth |
| `/account` | Customer account |
| `/admin` | Product admin |
| `/owner` | Owner dashboard and site CMS |

## Roles

- **Customer** — browse, cart, orders, addresses
- **Admin** — permissions assigned by the owner (products, orders, customers, reports, gallery, settings)
- **Owner** — full access, including staff management

## Development notes

- CORS allowed origins are configured in `CeramicStore.Api/appsettings.json`
- Online payment is not implemented; orders are created for manual follow-up
- Uploaded images are stored under `CeramicStore.Api/wwwroot/uploads` (ignored by git)
- Secrets stay in .NET user-secrets / local `.env` — never commit them

## License

Private project unless otherwise stated by the repository owner.
