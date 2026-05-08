/**
 * Core domain configuration types
 */

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface DomainEndpoints {
  mcp: string;
  api: string;
  [key: string]: string;
}

export interface MockDataGenerator {
  [key: string]: () => any;
}

export interface DomainValidator {
  validate: (data: any) => boolean;
  errorMessage?: string;
}

export interface TestContext {
  domain: string;
  endpoints: DomainEndpoints;
  mockData: Record<string, any>;
  config: DomainConfig;
}

export interface DomainConfig {
  name: string;
  description: string;
  version: string;
  endpoints: DomainEndpoints;
  mockDataGenerators: MockDataGenerator;
  mcpTools: MCPToolDefinition[];
  validators?: Record<string, DomainValidator>;
  customConfig?: Record<string, any>;
}
