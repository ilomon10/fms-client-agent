import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export class TrackerClient {
  protected axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL });
  }

  // async create<T>(url: string, data: T, config?: AxiosRequestConfig) {
  //   return this.axiosInstance.post(url, data, config);
  // }

  // async read<T>(url: string, config?: AxiosRequestConfig) {
  //   return this.axiosInstance.get<T>(url, config);
  // }

  // async update<T>(url: string, data: T, config?: AxiosRequestConfig) {
  //   return this.axiosInstance.put(url, data, config);
  // }
  async push<T>(data: T, config?: AxiosRequestConfig) {
    return await this.axiosInstance.post("/fms-tracker", data, config);
  }

  // async delete(url: string, config?: AxiosRequestConfig) {
  //   return this.axiosInstance.delete(url, config);
  // }
}
