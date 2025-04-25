type PrismaModel<T> = keyof T;
type PrismaMethod<T, M extends PrismaModel<T>> = keyof T[M] & string;

interface PrismaRestClientConfig {
  apiUrl: string;
  token: string;
}

export class PrismaRestClient<T> {
  private config: PrismaRestClientConfig;

  constructor(config: PrismaRestClientConfig) {
    this.config = config;
  }

  public setToken(token: string): void {
    this.config.token = token;
  }

  public setApiUrl(apiUrl: string): void {
    this.config.apiUrl = apiUrl;
  }

  public useClient(): {
    [M in PrismaModel<T>]: {
      [K in PrismaMethod<T, M>]: T[M][K] extends (...args: any[]) => Promise<infer R>
        ? (payload: Parameters<T[M][K]>[0]) => Promise<R>
        : never;
    };
  } {
    return new Proxy({} as any, {
      get: (_, model: string | symbol) => {
        if (typeof model !== 'string') {
          throw new Error('Only string models are supported');
        }
        
        return new Proxy({} as any, {
          get: (_, method: string | symbol) => {
            if (typeof method !== 'string') {
              throw new Error('Only string methods are supported');
            }
            
            return async (payload: unknown) => {
              const url = `${this.config.apiUrl}/${method}/${model}`;
              
              try {
                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.token}`,
                  },
                  body: JSON.stringify(payload),
                });

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || 'API request failed');
                }

                return (await response.json())?.data;
              } catch (error) {
                throw error;
              }
            };
          },
        });
      },
    });
  }
} 