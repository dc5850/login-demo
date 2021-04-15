import React, { useReducer, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import styles from './Login.module.css';

const loginEndpointUrl = 'https://services.adaptr.com/demo/login';

const initialState = {
  loading: false,
  error: '',
  sessionToken: '',
  username: '',
  password: ''
};

const reducer = (state, action) => {
  switch(action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        sessionToken: action.payload,
        error: ''
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        sessionToken: '',
        error: action.payload
      };
    case 'SET_FORM_FIELD':
      return {
        ...state,
        [action.payload.name]: action.payload.value
      };
    case 'SUBMIT_FORM':
      return {
        ...state,
        loading: true
      };
    default: 
      return state;
  }
};

export default function Login() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cookies, setCookie, removeCookie] = useCookies(['session-cookie']);
  const { loading, error, sessionToken, username, password } = state;
  
  useEffect(() => {
    if (sessionToken) {
      setCookie('session-cookie', sessionToken);
      console.log('redirect');
    }
  }, [sessionToken, setCookie]);

  function handleField({name, value}) {
    dispatch({type: 'SET_FORM_FIELD', payload: {name, value}});
  }

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({type: 'SUBMIT_FORM', payload: ''});
    axios
    .post(loginEndpointUrl, {
      username,
      password
    })
    .then(response => {
      if (response.data.success) {
        dispatch({type: 'FETCH_SUCCESS', payload: response.data.token});
      } else {
        dispatch({type: 'FETCH_ERROR', payload: response.data.error.message});
      }
    })
    .catch(error => {
      dispatch({type: 'FETCH_ERROR', payload: error.message});
    });
  }

  return (
    <div className={styles.wrapper}>
      <div>
      { loading
          ? <div className={styles.loading}>Loading...</div>
          : sessionToken
            ? <div className={styles.success}>Token value saved as a cookie: {sessionToken}</div>
            : <div className={styles.login}>
                <h1 className={styles.heading}>Login Form</h1>
                <form onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <span className={`${styles.fieldLabel} fas fa-user`}></span>
                    <input className={styles.fieldInput} placeholder="Username" type="text" value={username} name="username" onChange={e => handleField(e.target) } />
                  </div>
                  <div className={styles.field}>
                    <span className={`${styles.fieldLabel} fas fa-lock`}></span>
                    <input className={styles.fieldInput} placeholder="Password" type="password" value={password} name="password" onChange={e => handleField(e.target) } />
                  </div>
                  <input className={styles.submitButton} type="submit" value="Sign In" />
                </form>
                { error ? <div className={styles.error}>Error: {error}, Please try resubmitting the form</div> : null}
              </div>
      }
      </div>
    </div>
  );
}
