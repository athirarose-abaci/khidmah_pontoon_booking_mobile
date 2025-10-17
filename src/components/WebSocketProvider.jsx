import React, {useEffect, useRef} from 'react';
import {io} from 'socket.io-client';
import {useDispatch, useSelector} from 'react-redux';
import {
  setConnectionStatus,
  setLastPing,
  setError,
} from '../../store/socketSlice';
import { SOCKET_URL } from '../constants/baseUrl';

const WebSocketProvider = ({children}) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const user = useSelector(state => state.authSlice.authState);
  const isConnected = useSelector(state => state.socketSlice.isConnected);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!SOCKET_URL) {
      return;
    }

    try {
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
        path: '/ws/socket.io',
        extraHeaders: {
          'Access-Control-Allow-Origin': '*',
        },
        withCredentials:true
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        dispatch(setConnectionStatus(true));
        // console.log('socket connected')
        dispatch(setError(null));
      });

      socket.on('disconnect', reason => {
        dispatch(setConnectionStatus(false));
        // console.log('soket disconnected',reason)
      });

      socket.on('connect_error', error => {
        dispatch(setError(error.message));
        // console.log('soket connect error',error?.name)
        // console.log('soket connect error name',error?.message)
      });

      socket.on('error', error => {
        dispatch(setError(error.message));
        // console.log('soket error',error)
      });

      // Handle incoming messages
      socket.on('message', message => {
        try {
          const parsedMessage =
            typeof message === 'string' ? JSON.parse(message) : message;

          switch (parsedMessage?.type) {
            case 'ping':
              dispatch(setLastPing(Date.now()));
              break;
            default:
              console.log('Unhandled message type:', parsedMessage.type);
          }
        } catch (err) {
          // Pass
        }
      });

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping', {
            timestamp: Date.now(),
            userId: user?.user?.id || user?.id,
          });
        }
      }, 30000); // Send ping every 30 seconds

      return () => {
        clearInterval(pingInterval);
        if (socket.connected) {
          socket.disconnect();
        }
      };
    } catch (error) {
      dispatch(setError(error.message));
    }
  }, [user, dispatch]);

  return children;
};

export default WebSocketProvider;
