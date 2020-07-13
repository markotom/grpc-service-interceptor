const grpc = require('grpc');
const compose = require('koa-compose');
const debug = require('debug')('grpc-service-interceptor');

module.exports = class GrpcServiceInterceptor {
  constructor({ grpcServer, grpcServiceDefinition }) {
    if (!grpcServer) {
      throw Error('Service should be initiated with a grpc server');
    }

    if (!grpcServiceDefinition) {
      throw Error('Service should be initiated with a service proto definition');
    }

    if (!(grpcServer instanceof grpc.Server)) {
      throw Error('Service should have a valid grpc server to be initiated');
    }

    this.grpcServer = grpcServer;
    this.grpcServiceDefinition = grpcServiceDefinition;
    this.methods = {};
    this.configured = false;

    debug('grpc service created');
  }

  addMethod(methodName, ...interceptors) {
    if (!interceptors.length) {
      throw Error('Method must have at least one handler');
    }

    const isValidMethod = Object.keys(this.grpcServiceDefinition).find((serviceMethodName) =>
      new RegExp(`^${methodName}$`, 'i').test(serviceMethodName),
    );

    if (!isValidMethod) {
      throw Error('Method not found in service definition');
    }

    interceptors.forEach((interceptor) => {
      const interceptorType = typeof interceptor;
      if (interceptorType !== 'function') {
        throw new Error(
          `${methodName}: \`interceptor\` must be a function, not \`${interceptorType}\``,
        );
      }
    });

    this.methods[methodName] = {
      interceptors,
      handler: async (call, callback) => {
        const ctx = {
          call,
          callback,
        };

        const stack = [].concat(interceptors);
        const handler = stack.pop();

        if (interceptors.length) {
          return compose(interceptors)(ctx).then(() => handler(ctx));
        }

        return handler(ctx);
      },
    };

    debug('added grpc service method %s', methodName);

    return this;
  }

  configure() {
    const methods = {};

    Object.keys(this.methods).forEach((method) => {
      methods[method] = this.methods[method].handler;
    });

    this.grpcServer.addService(this.grpcServiceDefinition, methods);
    this.configured = true;

    debug('grpc service was configured');
  }
};
