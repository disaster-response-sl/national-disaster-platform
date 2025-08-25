#!/bin/bash

# Set Android emulator location to Sri Lankan cities
# Usage: ./set_emulator_location.sh [city]
# Cities: colombo, malabe, negombo, kandy, galle, ratnapura

CITY=${1:-"colombo"}

case $CITY in
    "colombo")
        echo "🏙️ Setting location to Colombo, Sri Lanka..."
        adb emu geo fix 79.8612 6.9271
        ;;
    "malabe")
        echo "🏫 Setting location to Malabe, Sri Lanka..."
        adb emu geo fix 79.958 6.9056
        ;;
    "negombo")
        echo "🏖️ Setting location to Negombo, Sri Lanka..."
        adb emu geo fix 79.8353 7.2083
        ;;
    "kandy")
        echo "⛰️ Setting location to Kandy, Sri Lanka..."
        adb emu geo fix 80.6337 7.2966
        ;;
    "galle")
        echo "🏰 Setting location to Galle, Sri Lanka..."
        adb emu geo fix 80.2170 6.0367
        ;;
    "ratnapura")
        echo "💎 Setting location to Ratnapura, Sri Lanka..."
        adb emu geo fix 80.4037 6.6828
        ;;
    *)
        echo "❌ Unknown city: $CITY"
        echo "Available cities: colombo, malabe, negombo, kandy, galle, ratnapura"
        exit 1
        ;;
esac

echo "✅ Location set to $CITY"
echo "📱 Open your app and check the coordinates!"
