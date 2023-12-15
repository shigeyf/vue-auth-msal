# Contributing to `vue-auth-msal` Vue Plugin library

## How to build

1. Clone this repository.

2. Setup submodules for package development

   ```bash
   ./scripts/setup-submodules.sh
   ```

3. Run the following commands to build external modules

   ```bash
   cd ./externals/msal-js/lib/msal-common/
   npm install
   npm run build

   cd ./externals/msal-js/lib/msal-browser/
   npm install
   npm run build
   ```

4. Setup this repository for development

   ```bash
   npm install
   ```

5. Build packages and samples

   ```bash
   npm run build
   ```
