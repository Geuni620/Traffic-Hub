# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev      # Start development server (localhost:3000)
pnpm run build    # Build for production
pnpm run lint     # Run Next.js linting
pnpm run eslint   # Run ESLint with auto-fix
pnpm run deploy   # Deploy to Vercel
```

## Architecture Overview

Traffic-Hub is a traffic data visualization app using Next.js App Router, Google Maps, and Supabase.

### Zoom-Based Rendering Strategy

The app renders different marker types based on zoom level:

| Zoom Level | Rendering Mode | API Endpoint | Description |
|------------|----------------|--------------|-------------|
| ≤ 10 | Region | `/api/region` | Pre-aggregated regional markers |
| 10 < zoom ≤ 12.5 | Cluster | `/api/clusters` | DBSCAN-clustered markers |
| > 12.5 | Individual | `/api/traffic` | Individual traffic markers |

Constants defined in `constant/location.ts`:
- `SHOW_CLUSTER_ZOOM_LEVEL = 10`
- `SHOW_MARKER_ZOOM_LEVEL = 12.5`

### Data Flow

```
Map Pan/Zoom → useGoogleMapsZoom() → useTrafficGetQuery()
→ API Routes → Supabase (traffic_hub table) → React Query Cache
→ MarkerContainer (conditional rendering)
```

### State Management

- **Google Maps instance**: `external-state` store (`store/googleMapStore.ts`) - avoids React context re-renders
- **Server state**: React Query (`@tanstack/react-query`) with query key factory in `lib/query/queryFactory.ts`
- **Category filters**: Local state via `useCategoryFilter` hook

### Key Directories

- `app/api/` - API routes (traffic, clusters, region)
- `components/map/` - Map components (marker-container, traffic-hub, cluster, region, marker)
- `components/legend/` - Filter toggle UI components
- `components/ui/` - shadcn/ui primitives
- `hooks/` - Custom hooks (useTrafficGetQuery, useRegionGetQuery, useCategoryFilter, useGoogleMapsZoom)
- `utils/supabase/` - Supabase clients (server.ts, client.ts, middleware.ts)
- `constant/` - App constants (location, legend, traffic colors)

### API Request Pattern

All traffic endpoints accept:
- `latitude`, `longitude` - Map center
- `latitudeDelta`, `longitudeDelta` - Map bounds
- `category` - Comma-separated filter list (highway, seoul, incheon, busan, daegu, daejeon, toll)

### Database

Supabase table `traffic_hub` with columns:
- `x_code`, `y_code` - Coordinates
- `source` - Traffic category
- `aadt_2021`, `aadt_2022`, `aadt_2023` - Annual Average Daily Traffic

## Environment Variables

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY   # Google Maps API key
NEXT_PUBLIC_MAPS_ID               # Google Maps style ID
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key
```

## Important Notes

- Next.js 15+ requires `await cookies()` in API routes (async change)
- Uses `@googlemaps/react-wrapper` for Google Maps integration
- DBSCAN clustering via `density-clustering` package (epsilon=0.02, min=2)
- UI components from shadcn/ui (Radix UI + Tailwind)
