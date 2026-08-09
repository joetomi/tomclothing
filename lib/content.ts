import fs from 'fs';
import path from 'path';
import { SiteConfig } from '@/types/site';
import { siteConfigSchema } from './validation';

const contentPath = path.join(process.cwd(), 'content', 'site.json');

export async function getSiteContent(): Promise<SiteConfig> {
  try {
    if (!fs.existsSync(contentPath)) {
      throw new Error(`Content file missing at ${contentPath}`);
    }
    const rawData = fs.readFileSync(contentPath, 'utf8');
    const parsed = JSON.parse(rawData);
    
    // Validate schema with Zod
    const validated = siteConfigSchema.parse(parsed);
    return validated as SiteConfig;
  } catch (error) {
    console.error("Error reading site.json:", error);
    // Fallback to basic safe structure if parse fails
    const rawData = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(rawData) as SiteConfig;
  }
}

export async function saveSiteContentLocal(newContent: SiteConfig): Promise<{ success: boolean; sha?: string }> {
  try {
    const validated = siteConfigSchema.parse(newContent);
    const jsonString = JSON.stringify(validated, null, 2);
    fs.writeFileSync(contentPath, jsonString, 'utf8');
    return { success: true };
  } catch (error) {
    console.error("Error saving site.json locally:", error);
    throw error;
  }
}
