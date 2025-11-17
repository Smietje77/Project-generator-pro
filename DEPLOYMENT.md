# 🚀 Deployment Guide - Project Generator Pro

**Target Platform:** Dokploy
**Server:** srv838705.hstgr.cloud
**Domain:** https://project.n8naccess.xyz
**Last Updated:** 2025-11-15

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Dokploy Setup](#dokploy-setup)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required
- ✅ Dokploy instance running on srv838705.hstgr.cloud
- ✅ GitHub repository: https://github.com/Smietje77/project-generator-pro
- ✅ Domain configured: project.n8naccess.xyz
- ✅ Node.js 20+ runtime support in Dokploy
- ✅ Environment variables configured (see below)

### Recommended
- SSL certificate configured for HTTPS
- GitHub webhook for auto-deployment
- Monitoring solution (e.g., UptimeRobot)

---

## Environment Variables

Configure these in Dokploy dashboard before deployment:

### Required Variables

```bash
# Authentication
ACCESS_CODE=vibe2024

# Anthropic API (for optional Claude API features)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# GitHub Integration
GITHUB_TOKEN=your-github-token-here
GITHUB_USERNAME=Smietje77

# Environment
NODE_ENV=production

# Public URL
PUBLIC_URL=https://project.n8naccess.xyz
```

### Optional Variables

```bash
# Custom port (if needed)
PORT=3000

# Additional security
COOKIE_SECRET=generate-random-secret-here
```

---

## Dokploy Setup

### Step 1: Access Dokploy Dashboard

1. Navigate to your Dokploy dashboard on srv838705.hstgr.cloud
2. Login with your credentials

### Step 2: Create New Project

1. Click **"New Project"**
2. Enter project details:
   - **Name:** project-generator-pro
   - **Description:** AI-powered project scaffolding tool with Claude Code integration
   - **Type:** Node.js Application

### Step 3: Connect GitHub Repository

1. Click **"Connect Repository"**
2. Select GitHub provider
3. Choose repository: `Smietje77/project-generator-pro`
4. Branch: `main`
5. Authorize Dokploy to access your repository

### Step 4: Configure Build Settings

Enter the following build configuration:

**Build Settings:**
```yaml
Build Command: npm install && npm run build
Start Command: node ./dist/server/entry.mjs
Output Directory: dist
Node Version: 20
```

**Important Notes:**
- Astro uses `@astrojs/node` adapter for SSR
- The entry point is generated during build: `dist/server/entry.mjs`
- Make sure "Server-side Rendering" is enabled in Dokploy

### Step 5: Add Environment Variables

1. Navigate to **"Environment Variables"** tab
2. Add all variables from the [Environment Variables](#environment-variables) section
3. Mark sensitive variables as "Secret" (API keys, tokens)

### Step 6: Configure Domain

1. Go to **"Domains"** tab
2. Add custom domain: `project.n8naccess.xyz`
3. Enable **"Force HTTPS"**
4. Enable **"Auto SSL"** (Let's Encrypt)
5. Save configuration

### Step 7: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (usually 2-5 minutes)
3. Monitor logs for any errors
4. Once complete, service will be live at https://project.n8naccess.xyz

---

## Deployment Steps

### Manual Deployment

```bash
# 1. Ensure all changes are committed
git status
git add .
git commit -m "feat: ready for production deployment"

# 2. Push to GitHub
git push origin main

# 3. Dokploy will auto-deploy (if webhook configured)
# OR manually trigger deployment in Dokploy dashboard
```

### CI/CD Deployment (Optional)

If using GitHub Actions, the workflow in `.github/workflows/deploy.yml` will:
1. Run on every push to `main`
2. Install dependencies
3. Run build
4. Test health endpoint
5. Trigger Dokploy deployment (if configured)

---

## Post-Deployment Verification

### Critical Checks ✅

Run these checks immediately after deployment:

#### 1. Health Check
```bash
curl https://project.n8naccess.xyz/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T...",
  "version": "1.0.0",
  "environment": "production",
  "service": "Project Generator Pro",
  "uptime": 123,
  "checks": {
    "api": "operational",
    "auth": "operational",
    "mcp": "ready"
  }
}
```

#### 2. Main Page Load
Visit: https://project.n8naccess.xyz

**Verify:**
- ✅ Hero section displays correctly
- ✅ "Get Started" button visible
- ✅ No console errors in browser DevTools
- ✅ Page is responsive on mobile

#### 3. Authentication Test
1. Click "Get Started"
2. Enter access code: `vibe2024`
3. Click "Login"

**Verify:**
- ✅ Login succeeds
- ✅ Wizard appears
- ✅ No error messages

#### 4. API Endpoints Test
```bash
# Auth verify
curl https://project.n8naccess.xyz/api/auth/verify

# Should return: {"authenticated":false}
```

#### 5. Browser Console Check
1. Open DevTools (F12)
2. Check Console tab

**Verify:**
- ✅ No errors (red messages)
- ✅ No 404s for resources
- ✅ Alpine.js loads correctly

#### 6. Responsive Design Test
Test on:
- ✅ Mobile (375px width)
- ✅ Tablet (768px width)
- ✅ Desktop (1280px+ width)

#### 7. SSL Certificate
Check: https://www.ssllabs.com/ssltest/analyze.html?d=project.n8naccess.xyz

**Verify:**
- ✅ A or A+ rating
- ✅ Certificate is valid
- ✅ No mixed content warnings

---

## Troubleshooting

### Build Failures

**Problem:** Build fails with TypeScript errors

**Solution:**
```bash
# Run locally to reproduce
npm run build

# Fix TypeScript errors
npm run astro check

# Commit and redeploy
git add .
git commit -m "fix: resolve TypeScript errors"
git push
```

---

**Problem:** Build fails with missing dependencies

**Solution:**
Check `package.json` has all dependencies:
```bash
npm install
npm run build  # Test locally
```

### Environment Variable Issues

**Problem:** API returns 401 Unauthorized after login

**Solution:**
- Verify `ACCESS_CODE` is set in Dokploy environment variables
- Check for typos in variable names
- Restart the service after adding/changing variables

---

**Problem:** GitHub integration fails

**Solution:**
- Verify `GITHUB_TOKEN` has correct permissions:
  - `repo` scope
  - `workflow` scope (for Actions)
- Verify `GITHUB_USERNAME` matches your GitHub username exactly
- Test token with: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

### API Endpoint 404s

**Problem:** API routes return 404 in production

**Solution:**
- Verify Astro adapter is set to `node` (not `static`)
- Check `astro.config.mjs`:
  ```javascript
  export default defineConfig({
    output: 'server',  // Must be 'server' or 'hybrid'
    adapter: node()
  });
  ```
- Rebuild and redeploy

### CORS Issues

**Problem:** Browser blocks API requests with CORS error

**Solution:**
Add CORS middleware in `src/middleware/index.ts`:
```typescript
export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  const response = await next();

  // Add CORS headers for production
  if (import.meta.env.PROD) {
    response.headers.set('Access-Control-Allow-Origin', 'https://project.n8naccess.xyz');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
});
```

### SSL Certificate Problems

**Problem:** Mixed content warnings (HTTP resources on HTTPS page)

**Solution:**
- Ensure all external resources use HTTPS
- Check for hardcoded HTTP URLs in code
- Update to relative URLs where possible

---

**Problem:** SSL certificate not auto-renewing

**Solution:**
- Verify domain DNS points correctly to server
- Check Dokploy SSL settings
- Manually trigger renewal in Dokploy dashboard

### Performance Issues

**Problem:** Slow page loads

**Solution:**
1. Enable compression in Dokploy (gzip/brotli)
2. Optimize images with `sharp`
3. Enable CDN for static assets
4. Check server resources (CPU/RAM usage)

---

**Problem:** High server load

**Solution:**
- Add rate limiting to API endpoints
- Implement caching for analysis results
- Scale horizontally (add more instances)

---

## Monitoring & Maintenance

### Health Monitoring

**Set up automated monitoring:**

1. **UptimeRobot** (Recommended - Free)
   - URL: https://uptimerobot.com
   - Monitor: https://project.n8naccess.xyz/api/health
   - Check interval: 5 minutes
   - Alert: Email on downtime

2. **Pingdom** (Alternative)
   - Similar setup to UptimeRobot
   - More detailed analytics

### Log Monitoring

**In Dokploy Dashboard:**
1. Navigate to your project
2. Click "Logs" tab
3. Monitor for:
   - Error messages
   - Unusual traffic patterns
   - Failed authentication attempts

**Example log search:**
```bash
# Filter for errors
grep "error" logs.txt

# Filter for auth failures
grep "Unauthorized" logs.txt
```

### Performance Metrics

**Monitor these metrics:**
- **Response Time:** < 200ms for health check
- **Uptime:** > 99.5%
- **Error Rate:** < 0.1%
- **Memory Usage:** < 80% of allocated
- **CPU Usage:** < 70% average

### Backup Strategy

**Recommended backups:**

1. **Code:** Already backed up in GitHub
2. **Environment Variables:** Export from Dokploy monthly
3. **Database:** Not applicable (stateless app)

**Backup Schedule:**
- GitHub: Automatic (every commit)
- Dokploy Config: Manual export monthly

### Security Updates

**Monthly Tasks:**
1. Update dependencies:
   ```bash
   npm outdated
   npm update
   npm audit fix
   ```

2. Review security advisories:
   ```bash
   npm audit
   ```

3. Update Astro:
   ```bash
   npx @astrojs/upgrade
   ```

### Scaling Considerations

**When to scale:**
- Response time > 500ms consistently
- CPU usage > 80% for extended periods
- Memory usage > 90%

**Scaling options:**
1. **Vertical:** Increase server resources in Dokploy
2. **Horizontal:** Add more instances (load balancing)

---

## Additional Resources

### Documentation
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [Dokploy Documentation](https://dokploy.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Support
- **GitHub Issues:** https://github.com/Smietje77/project-generator-pro/issues
- **Dokploy Support:** Check Dokploy dashboard

---

## Deployment Checklist

Before marking deployment complete, verify:

- [ ] Production build succeeds locally (`npm run build`)
- [ ] All environment variables configured in Dokploy
- [ ] GitHub repository connected to Dokploy
- [ ] Domain points to Dokploy server
- [ ] SSL certificate is active and valid
- [ ] Health endpoint returns 200 OK
- [ ] Main page loads without errors
- [ ] Login with "vibe2024" works
- [ ] Wizard steps are accessible
- [ ] API endpoints return correct responses
- [ ] No console errors in browser
- [ ] Responsive design verified on mobile/tablet/desktop
- [ ] Uptime monitoring configured
- [ ] GitHub webhook for auto-deployment (optional)

---

**Deployment Status:** Ready for Production 🚀

**Last Verified:** 2025-11-15
**Next Review:** 2025-12-15

---

*For questions or issues, contact the development team or open an issue on GitHub.*
