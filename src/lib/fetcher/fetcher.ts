import axios, { AxiosInstance, AxiosRequestConfig } from "npm:axios";

type ConstructorArgs = {
  baseUrl: string;
  apiKey: string;
};

export class Fetcher {
  private baseUrl: string;
  private fetcherInstance: AxiosInstance;
  constructor({ baseUrl, apiKey }: ConstructorArgs) {
    this.baseUrl = baseUrl;
    this.fetcherInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "x-api-key": apiKey,
      },
    });
  }

  public get<T>(endpoint: string, opts?: AxiosRequestConfig) {
    return this.fetcherInstance.get<T>(endpoint, opts);
  }
}
