import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try{

    const endpoint = type === 'password' ? 'updateMyPassword' : 'updateMe'; 

    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/users/${endpoint}`,
      data
    });

    if(res.data.status === 'success'){
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }

  }catch(e){
    showAlert('error', e.response.data.message);
  }
}