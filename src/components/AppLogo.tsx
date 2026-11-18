  import { Image } from 'react-native';


export function AppLogo() {
  return (
    <Image
      source={require('../../assets/images/logo.webp')}
      style={{ width: '100%', height: '100%' }}
      resizeMode="contain"
    />
  );
}