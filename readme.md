# gRPC Service Interceptor

Creates a service from a given gRPC server, allowing you to configure interceptors for its methods.

## Installation

```
$ npm install grpc-service-interceptor --save
```

## Usage

```js
const GrpcServiceInterceptor = require('grpc-service-interceptor');

const service = new GrpcServiceInterceptor({
  grpcServer,
  grpcServiceDefinition,
});

const firstInterceptor = async (ctx, next) => {
  // ctx.call, ctx.callback
  next();
};

const secondInterceptor = async (ctx, next) => {
  next();
};

const firstHandler = async (ctx) => {
  // handle response
};

const secondHandler = async (ctx) => {
  // handle response
};

service.addMethod('methodName', firstInterceptor, secondInterceptor, firstHandler);
service.addMethod('anotherMethodName', firstInterceptor, secondInterceptor, secondHandler);

service.configure();
```
