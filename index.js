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
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Root = () => {
    return (

        <Provider store = {store}>
            <SafeAreaProvider>
                <ToastProvider>
                    <AxiosProvider>
                        <App />
                    </AxiosProvider>
                </ToastProvider>
            </SafeAreaProvider>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Root);
