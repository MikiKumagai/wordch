import axios from 'axios';
import QueryString from 'qs';

/**
 * Api通信用クラス
 */
class Api {
  /**
   * GET処理
   * @param {string} url
   * @param {Function} successHandler
   * @param params
   */
  static async get(url, successHandler, params) {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + url,
        {
          params: params,
          paramsSerializer: (params) => {
            return QueryString.stringify(params, { arrayFormat: 'repeat' });
          },
        });
      if (successHandler && typeof successHandler === 'function') {
        successHandler(response.data);
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * POST処理
   * @param {string} url
   * @param {object} data
   * @param {Function} successHandler
   */
  static async post(url, data, successHandler) {
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + url,
        data
      );
      if (successHandler && typeof successHandler === 'function') {
        successHandler(response.data);
      }
    } catch (error) {
      console.log(error)
    }
  }

}
export default Api;