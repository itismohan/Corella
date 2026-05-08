import path from 'path';
import { DomainConfig } from '../types/domain';

/**
 * Load domain configuration based on environment variable or default
 */
export async function loadDomainConfig(domainName?: string): Promise<DomainConfig> {
  const configPath = process.env.DOMAIN_CONFIG || 
                     domainName || 
                     path.join(__dirname, '../../domain-configs/insurance.config.ts');
  
  try {
    // Dynamically import the configuration
    const configModule = await import(configPath);
    
    // Find the config export (usually domainConfig, insuranceDomainConfig, etc.)
    const configKey = Object.keys(configModule).find(key => 
      key.includes('Config') && typeof configModule[key] === 'object'
    );
    
    if (!configKey) {
      throw new Error(`No domain config found in ${configPath}`);
    }
    
    const config: DomainConfig = configModule[configKey];
    validateDomainConfig(config);
    return config;
  } catch (error) {
    console.error(`Failed to load domain config from ${configPath}:`, error);
    throw error;
  }
}

/**
 * Validate that domain configuration has all required fields
 */
export function validateDomainConfig(config: DomainConfig): void {
  if (!config.name) {
    throw new Error('Domain config must have a name');
  }
  
  if (!config.endpoints || typeof config.endpoints !== 'object') {
    throw new Error('Domain config must have endpoints object');
  }
  
  if (!config.mockDataGenerators || typeof config.mockDataGenerators !== 'object') {
    throw new Error('Domain config must have mockDataGenerators');
  }
  
  if (!Array.isArray(config.mcpTools)) {
    throw new Error('Domain config must have mcpTools array');
  }
  
  // Validate each tool
  config.mcpTools.forEach((tool, index) => {
    if (!tool.name) {
      throw new Error(`MCP tool at index ${index} must have a name`);
    }
    if (!tool.inputSchema) {
      throw new Error(`MCP tool "${tool.name}" must have an inputSchema`);
    }
  });
}

/**
 * Get the current domain name from environment or loaded config
 */
export function getCurrentDomainName(): string {
  const configPath = process.env.DOMAIN_CONFIG || '';
  if (configPath.includes('insurance')) return 'Insurance';
  if (configPath.includes('healthcare')) return 'Healthcare';
  if (configPath.includes('ecommerce')) return 'E-Commerce';
  return 'Custom Domain';
}

/**
 * List all available domain configurations
 */
export function getAvailableDomains(): string[] {
  return [
    'Insurance',
    'Healthcare',
    'E-Commerce',
    'Custom'
  ];
}
