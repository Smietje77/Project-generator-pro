import type { APIRoute } from 'astro';
import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';

/**
 * GET /api/download-zip?project=project-name
 *
 * Creates and returns a ZIP file of the generated project
 *
 * Query Parameters:
 * - project: string (sanitized project name)
 *
 * Response:
 * - 200: ZIP file binary
 * - 400: { success: false, error: string }
 * - 401: { success: false, error: "Unauthorized" }
 * - 404: { success: false, error: "Project not found" }
 * - 500: { success: false, error: string }
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    // Authentication check
    const authToken = cookies.get('auth_token');
    if (authToken?.value !== 'authenticated') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get project name from query params
    const projectName = url.searchParams.get('project');
    if (!projectName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Project name is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build project path using environment variable
    const basePath = process.env.CLAUDE_PROJECTS_PATH || '/root/apps/Projects';
    const projectPath = path.join(basePath, projectName);

    // Check if project exists
    if (!fs.existsSync(projectPath)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Project not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Recursively add files to ZIP
    function addFolderToZip(folderPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(folderPath);

      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          const newZipFolder = zipFolder.folder(item);
          if (newZipFolder) {
            addFolderToZip(itemPath, newZipFolder);
          }
        } else {
          const content = fs.readFileSync(itemPath);
          zipFolder.file(item, content);
        }
      }
    }

    // Add all project files to ZIP
    addFolderToZip(projectPath, zip);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    });

    // Return ZIP file
    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName}.zip"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('ZIP download error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ZIP file'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
