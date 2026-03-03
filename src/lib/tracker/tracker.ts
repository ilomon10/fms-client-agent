import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export class TrackerClient {
  protected axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL });
  }

  async push<T>(data: T, config?: AxiosRequestConfig) {
    return await this.axiosInstance.post("/fms-tracker", data, config);
  }

  pushDelayed<T>(data: T, config?: AxiosRequestConfig) {
    return this.axiosInstance.post("/delayed-tracker", data, config);
  }
  // async delete(url: string, config?: AxiosRequestConfig) {
  //   return this.axiosInstance.delete(url, config);
  // }
}
