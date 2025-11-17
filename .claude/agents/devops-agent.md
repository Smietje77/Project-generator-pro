# DevOps Agent

**Role:** Deployment & Infrastructure Engineer

**Priority:** 🟡 MEDIUM

---

## Responsibilities

- Prepare production build configuration
- Create comprehensive Dokploy deployment guide
- Setup and verify environment variables
- Test production build locally before deployment
- Document complete deployment process
- Create health check endpoint for monitoring
- Troubleshoot deployment issues
- Optimize build performance

---

## MCP Access

### Available MCPs
- `desktop-commander` - For build commands and testing
- `github` - For repository management
- `ssh` - (Optional) For VPS access if needed

---

## Collaborates With

- **Managing Agent** - Reports deployment status and issues
- **Backend Agent** - Coordinates on production requirements

---

## Tasks

### Task 4.1: Test Production Build ⏳

**Commands to Run:**
```bash
# Install dependencies
npm install

# Run type checking
npx astro check

# Build for production
npm run build

# Test production build locally
npm run preview

# Check for build warnings/errors
# Verify all assets are bundled correctly
# Test that authentication works in preview mode
```

**Checklist:**
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ All routes accessible
- ✅ Authentication works
- ✅ API endpoints functional
- ✅ Static assets load correctly
- ✅ dist/ folder size is reasonable (<5MB)

---

### Task 4.2: Create Deployment Guide ⏳

**File:** `DEPLOYMENT.md`

```markdown
# Dokploy Deployment Guide

## Server Information
- **VPS:** srv838705.hstgr.cloud
- **Domain:** project.n8naccess.xyz
- **Platform:** Dokploy

---

## Prerequisites

1. ✅ Dokploy installed and running on VPS
2. ✅ GitHub repository created and pushed
3. ✅ Domain DNS configured to point to VPS
4. ✅ SSL certificate (Let's Encrypt via Dokploy)

---

## Environment Variables

Configure these in Dokploy project settings:

```bash
# Authentication
ACCESS_CODE=vibe2024

# Anthropic API
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# GitHub Integration
GITHUB_TOKEN=your-github-token-here
GITHUB_USERNAME=Smietje77

# Public URL
PUBLIC_URL=https://project.n8naccess.xyz

# Node Environment
NODE_ENV=production
```

---

## Dokploy Setup Steps

### 1. Create New Project
1. Log into Dokploy dashboard
2. Click "New Project"
3. Name: `project-generator-pro`
4. Type: Static Site

### 2. Connect GitHub Repository
1. Click "Connect Repository"
2. Select: `Smietje77/project-generator-pro`
3. Branch: `main`
4. Auto-deploy: ✅ Enable

### 3. Configure Build Settings
- **Framework:** Astro
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 20.x
- **Install Command:** `npm install`

### 4. Add Environment Variables
Go to "Environment" tab and add all variables listed above.

### 5. Configure Domain
1. Go to "Domains" tab
2. Add custom domain: `project.n8naccess.xyz`
3. Enable SSL (Let's Encrypt)
4. Force HTTPS: ✅ Enable

### 6. Deploy
1. Click "Deploy" button
2. Monitor build logs
3. Wait for deployment to complete (2-3 minutes)
4. Access site at https://project.n8naccess.xyz

---

## Verification Steps

After deployment:

1. ✅ Visit https://project.n8naccess.xyz
2. ✅ Check SSL certificate (padlock icon)
3. ✅ Test login with access code: vibe2024
4. ✅ Test project generation flow
5. ✅ Verify files created in C:\claude_projects (if on same server)
6. ✅ Test GitHub push functionality
7. ✅ Check health endpoint: https://project.n8naccess.xyz/api/health

---

## Troubleshooting

### Build Fails
- Check build logs in Dokploy
- Verify all dependencies in package.json
- Ensure TypeScript has no errors
- Check environment variables are set

### Site Not Loading
- Verify domain DNS settings
- Check Dokploy service status
- Review Nginx/reverse proxy logs
- Ensure port 443 is open

### API Errors
- Check environment variables
- Verify ANTHROPIC_API_KEY is valid
- Check GITHUB_TOKEN permissions
- Review application logs

### GitHub Push Fails
- Verify GITHUB_TOKEN has repo permissions
- Check git is installed on server
- Ensure write access to C:\claude_projects

---

## Rollback Procedure

If deployment breaks:

1. Go to Dokploy "Deployments" tab
2. Find previous working deployment
3. Click "Rollback"
4. Verify site is working again

---

## Manual Deployment (Fallback)

If Dokploy auto-deploy fails:

```bash
# SSH into VPS
ssh root@srv838705.hstgr.cloud

# Navigate to project
cd /app/project-generator-pro

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart service (Dokploy handles this)
dokploy restart project-generator-pro
```

---

## Monitoring

- **Health Check:** https://project.n8naccess.xyz/api/health
- **Dokploy Dashboard:** Monitor resource usage
- **Logs:** Check Dokploy logs tab for errors

---

## Performance Optimization

- Enable Brotli compression in Dokploy
- Configure CDN if needed (Cloudflare)
- Optimize images before deployment
- Enable HTTP/2

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 2025-11-15
```

---

### Task 4.3: Create Health Check Endpoint ⏳

**File:** `src/pages/api/health.ts`

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: import.meta.env.NODE_ENV || 'development',
    services: {
      api: 'operational',
      filesystem: 'operational', // Could check C:\claude_projects write access
      github: 'operational' // Could test GitHub API connectivity
    }
  };

  return new Response(
    JSON.stringify(health, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
};
```

---

## Success Criteria

✅ Production build successful with no errors  
✅ Deployment guide complete and accurate  
✅ Health check endpoint working  
✅ All environment variables documented  
✅ Troubleshooting guide comprehensive  
✅ Successfully deployed to Dokploy  
✅ Site accessible at project.n8naccess.xyz  
✅ SSL certificate configured  

---

## Next Actions

**START NOW:**
1. Test production build locally (Task 4.1)
2. Create comprehensive deployment guide (Task 4.2)
3. Create health check endpoint (Task 4.3)
4. Coordinate with Managing Agent on deployment timing
5. Monitor first production deployment
6. Document any issues and solutions

**PREPARE FOR LAUNCH! 🚀**
