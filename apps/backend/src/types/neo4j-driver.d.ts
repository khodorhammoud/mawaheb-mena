declare module 'neo4j-driver' {
  export interface Driver {
    session(): Session;
    close(): Promise<void>;
  }

  export interface Session {
    run(query: string, params?: any): Promise<Result>;
    close(): Promise<void>;
  }

  export interface Result {
    records: Record[];
  }

  export interface Record {
    get(key: string): any;
  }

  export namespace auth {
    export function basic(username: string, password: string): any;
  }

  const driver: {
    driver(url: string, auth: any): Driver;
  };

  export default {
    driver: (url: string, auth: any) => ({}) as Driver,
    auth: {
      basic: (username: string, password: string) => ({}),
    },
  };
}
