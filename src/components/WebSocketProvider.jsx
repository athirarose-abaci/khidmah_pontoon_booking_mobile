import {useEffect, useRef, createContext, useContext} from 'react';
import {io} from 'socket.io-client';
import {useDispatch, useSelector} from 'react-redux';
import { setConnectionStatus, setLastPing, setError, } from '../../store/socketSlice';
import { SOCKET_URL } from '../constants/baseUrl';
import { setMessages } from '../../store/chatSlice';
import { addNotification } from '../../store/notificationSlice';

// Create a context for the socket
const SocketContext = createContext(null);

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
        console.log('socket connected')
        dispatch(setError(null));
      });

      // socket.emit('viewing_ticket', { ticket_id: 4 });

      socket.on('ticket_message', (message) => {
				dispatch(
					setMessages({
						ticketId: message?.message?.ticket_id,
						messages: message?.message?.conversation,
					}),
				);
			});

      socket.on('notification', (message) => {
				dispatch(addNotification(message?.message));
			});

      // socket.onAny((event, data) => {
			// 	console.log('🔵 SOCKET EVENT:', event, data);
			// });

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
              // console.log('Unhandled message type:', parsedMessage.type);
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

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export default WebSocketProvider;
