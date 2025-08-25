module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: {
          project: './ios/MobileApp.xcodeproj',
        },
      },
    },
  },
  assets: ['./src/assets/fonts/'], // Add this to link custom fonts
};
