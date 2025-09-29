import MainRouter from './routes/MainRouter';
import { ThemeProvider } from '@react-navigation/native';
import AbaciToast from './src/components/AbaciToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainRouter />
        <AbaciToast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
