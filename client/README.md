# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Configuring API URL (Cấu hình địa chỉ API)

This project connects to a Spring Boot backend. In order for physical mobile devices running **Expo Go** to communicate with your backend, you must configure the backend's local network IP address:

1. **Find your computer's local IP Address**:
   - On **Windows**: Open Command Prompt (`cmd`) and run `ipconfig`. Look for the IPv4 Address (e.g., `192.168.1.10`).
   - On **macOS/Linux**: Open terminal and run `ifconfig` or `ip a`. Look for the local IP (e.g., `192.168.1.10`).

2. **Create a `.env` file**:
   - Copy the contents of [.env.example](file:///d:/code/ctdmst/product/CookMateAI_test/client/.env.example) to a new file named `.env` in the `client` directory:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file and replace the IP address with your computer's local IP address:
     ```env
     EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8080/api/v1
     ```

3. **When changing Wi-Fi networks or computers**:
   - Every time you change Wi-Fi networks or your computer's IP address changes, you must update the `EXPO_PUBLIC_API_URL` value in your `.env` file and restart the Expo bundler:
     ```bash
     npx expo start -c
     ```
     *(The `-c` flag clears the bundler cache to ensure the new environment variable is loaded).*

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
