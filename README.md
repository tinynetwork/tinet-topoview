# tinet-topoview [![Netlify Status](https://api.netlify.com/api/v1/badges/a35371b9-b9c8-4b6f-805f-cd7bb9ac619c/deploy-status)](https://app.netlify.com/sites/tinet-topoview/deploys)

Visualize using [cytoscape.js](https://js.cytoscape.org/) from [tinet](https://github.com/slankdev/tinet) and [tinet-go](https://github.com/ak1ra24/tinet-go) configuration file.

**[Demo Site](https://tinet-topoview.netlify.com/)**

## Usage
- docker
```
docker build -t tinet-topoview .
docker run -it --rm -p 8080:80 --name tntopoview tinet-topoview
```

- yarn
  - Project setup
    ```
    yarn install
    ```
  - Compiles and hot-reloads for development
    ```
    yarn run serve
    ```
  - Compiles and minifies for production
    ```
    yarn run build
    ```
  - Lints and fixes files
    ```
    yarn run lint
    ```
  - Customize configuration
    - See [Configuration Reference](https://cli.vuejs.org/config/).
