import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { CoordsType, ResponseType } from '../types';

class WeatherStore {
  constructor() {
    makeAutoObservable(this);
    this.weatherData = { code: 0, message: 'Not sended' };
  }

  private interval!: NodeJS.Timeout;
  weatherData: ResponseType;

  private async findLocation() {
    console.log(100);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => await this.setWeatherData(coords),
      (err) => {
        this.weatherData  = { code: 502, message: 'Geoposition error: enable GPS or try to reload page' };
        console.log(err);
      },
      { enableHighAccuracy: true }
    );
  }

  async init() {
    await this.findLocation();
    this.interval = setInterval(
      async () => await this.findLocation(),
      180000,
    );
  }

  
  private async setWeatherData(coords: CoordsType) {
    this.weatherData = await this.sendRequest(coords);
  }

  private async corsRequest<T>(url: string) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With',
    };
    const result = await axios({
      method: 'GET',
      url,
      headers,
    });
    return await result.data as T;
  }

  private async sendRequest({ latitude, longitude }: CoordsType) {
    const url = `https://crinax-weather-app-server.herokuapp.com/api/v1/weather?&latitude=${latitude}&longitude=${longitude}`;

    return await this.corsRequest<ResponseType>(url);
  }
}

export default new WeatherStore();