import axios, { AxiosResponse } from 'axios';
import { ObjectId } from 'mongoose';
import {config} from '../../config/config';
import { IFavorHistory } from '../favor/favor.model';
import { IFavor, IUser } from '../user/user.model';

const vectorDBService = {
  addFavor: async function (userid: ObjectId, favor: IFavor, latitude: Number, longitude: Number): Promise<boolean> {
    const options: any = {
      method: 'POST',
      url: config.vectorDB.url + '/vectorDB/favor/add',
      params: {},
      headers: {
        'content-type': 'application/json',
      },
      data: {
        'userid': userid,
        'favor_title': favor.title,
        'favor_description': favor.description,
        'category': favor.category,
        'latitude': latitude,
        'longitude': longitude
      }
    };

    try{
      const response: AxiosResponse = await axios.request(options);
      return response.data.status == 1 ? true:false;
    }catch (error){
      console.error(error);
      return false;
    }
  },

  deleteFavor: async function (userid: ObjectId): Promise<boolean> {
    const options: any = {
      method: 'GET',
      url: config.vectorDB.url + '/vectorDB/favor/delete',
      params: {},
      headers: {
        'content-type': 'application/json',
      },
      data: {
        'userid': userid
      }
    };

    try{
      const response: AxiosResponse = await axios.request(options);
      return response.data.status == 1 ? true:false;
    }catch (error){
      console.error(error);
      return false;
    }
  },

  editFavor: async function (userid: ObjectId, favor: IFavor, latitude: Number, longitude: Number): Promise<boolean> {
    const options: any = {
      method: 'POST',
      url: config.vectorDB.url + '/vectorDB/favor/edit',
      params: {},
      headers: {
        'content-type': 'application/json',
      },
      data: {
        'userid': userid,
        'favor_title': favor.title,
        'favor_description': favor.description,
        'category': favor.category,
        'latitude': latitude,
        'longitude': longitude
      }
    };

    try{
      const response: AxiosResponse = await axios.request(options);
      return response.data.status == 1 ? true:false;
    }catch (error){
      console.error(error);
      return false;
    }
  },
  
  getRecommendation: async function (favor_history: IFavorHistory, user: Partial<IUser>, latitude: Number, longitude: Number): Promise<Array<ObjectId>> {
    let history = []
    for(let i = 0; i < favor_history.favors.length; i++){
      history.push({
        'userid': favor_history.favors[i].user_id,
        'favor_title': favor_history.favors[i].title,
        'favor_description': favor_history.favors[i].description,
        'like': favor_history.favors[i].like
      });
    }

    const options: any = {
      method: 'POST',
      url: config.vectorDB.url + '/recommender',
      params: {},
      headers: {
        'content-type': 'application/json',
      },
      data: {
        'userid': favor_history._id,
        'history': history,
        'latitude': latitude,
        'longitude': longitude,
        'category': user.preferences.favor_filters.favor_type,
        'max_distance': user.preferences.favor_filters.max_distance_km
      }
    };

    try{
      const response: AxiosResponse = await axios.request(options);
      return response.data.recommendations;
    }catch (error){
      console.error(error);
      return [];
    }
  }
}

export default vectorDBService;
