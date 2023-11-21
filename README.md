# Getting started

- Install [Expo](https://docs.expo.dev/get-started/installation/)
- Install dependencies using `npm install`
- Create and populate a `constant.js` file with constants `devEndpoint` and `prodEndpoint`
- Start enjoying hot-reload coding sessions after running `expo start`. If you want to test on your device run `expo start --tunnel` and flash the displayed QR code (you need the Expo Go app installed on your device)
- Deploy the app (some Expo account creation and Expo CLI setup might be needed for this step):
  - to iOS: using the command `eas build -p ios`
  - to Android: using the command `eas build -p android`
