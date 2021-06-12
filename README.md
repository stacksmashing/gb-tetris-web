# GB-Tetris-Web

The web part of the online Tetris project. Builds a static website.

## Build and run

Install node dependencies:

```
npm install
```

Run development server:

```
npm start
```


Note that WebUSB are only supported with HTTPS, so you need a certificate and can
then run the development server with:

```
HTTPS=true SSL_CRT_FILE=cert.pem SSL_KEY_FILE=keynp.pem npm start
```
