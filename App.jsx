import MainRouter from './routes/MainRouter';
import { ThemeProvider } from '@react-navigation/native';
import AbaciToast from './src/components/AbaciToast';

function App() {

  return (
    <ThemeProvider>
        <MainRouter />
        <AbaciToast />
    </ThemeProvider>
  );
}

export default App;
