declare module '@openai/agents' {
  export const webSearchTool: any;
  export class Runner {
    constructor(opts?: any);
    run(agent: any, items: any[], opts?: any): Promise<any>;
  }
  export class Agent<T = any> {
    constructor(opts: any);
  }
  export type RunContext<T = any> = any;
  export type AgentInputItem = any;
}


