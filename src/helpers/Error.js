function Error(error) {
    let error_msg = '';
    if (error?.response?.status === 400) {
      if (error?.response?.data?.message) {
        error_msg = error?.response?.data?.message;
      } else if (error?.response?.data[0]) {
        error_msg = error?.response?.data[0];
      } else if (error?.response?.data?.error) {
        error_msg = error?.response?.data?.error;
      } else if (error?.response?.data?.detail) {
        error_msg = error?.response?.data?.detail;
      } else {
        const error_key = Object.keys(error?.response?.data)[0];
        let error_field = error_key.replace(/_/g, ' ');
        error_field = error_field.charAt(0).toUpperCase() + error_field.slice(1);
        error_msg = `${error_field} : ${error?.response?.data[error_key].join()}`;
      }
    } else if (error?.response?.status === 500) {
      error_msg = 'Internal Server Error!!!';
    } else if (error?.response?.status === 502) {
      error_msg = 'Gateway timed out!!!';
    } else if (error?.response?.status === 504) {
      error_msg = 'Gateway timed out!!!';
    } else if (error?.response?.status === 406) {
      if (error?.response?.data?.error) {
        error_msg = error?.response?.data?.error;
      } else if (error?.response?.data?.messege) {
        error_msg = error?.response?.data?.messege;
      } else if (error?.response?.data) {
        error_msg = error?.response?.data;
      }
    } else if(error?.response?.status===401){
      error_msg = 'Authorization failed. Please login again.'
    }else if (error?.response?.data?.detail) {
      error_msg = error?.response?.data?.detail;
    } else if (error?.response?.data?.error) {
      error_msg = error?.response?.data?.error;
    } else if (error?.response?.status === 409) {
      error_msg = error?.response?.data;
    } else if (error?.response?.data?.error) {
      error_msg = error?.response?.data?.error;
    } else if (error?.response?.data) {
      error_msg = error?.response?.data;
    } else if (error?.messege) {
      error_msg = error?.message;
    } else {
      error_msg = 'Something Went Wrong';
    }
    return error_msg;
  }
  
  export default Error;