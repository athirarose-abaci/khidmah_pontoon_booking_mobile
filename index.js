/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import store from './store';
import { ToastProvider } from './src/context/ToastContext';
import { AxiosProvider } from './src/context/AxiosContext';

const Root = () => {
    return (
        <Provider store = {store}>
            <ToastProvider>
                <AxiosProvider>
                    <App />
                </AxiosProvider>
            </ToastProvider>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Root);
