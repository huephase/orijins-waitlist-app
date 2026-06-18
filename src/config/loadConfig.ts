import fs from 'node:fs';
import path from 'node:path';
import type { AppConfig } from '../types';

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = path.resolve(process.cwd(), '_main_config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  cachedConfig = JSON.parse(raw) as AppConfig;
  return cachedConfig;
}

export function buildCssVariables(config = loadConfig()): string {
  const colors = Object.entries(config.colors).map(([key, value]) => {
    const cssName = key.replace(/_/g, '-');
    return `--color-${cssName}: ${value};`;
  });

  return `:root { ${colors.join(' ')} --font-primary: '${config.fonts.primary}', sans-serif; --font-secondary: '${config.fonts.secondary}', serif; }`;
}
