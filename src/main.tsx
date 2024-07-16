import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>,
);