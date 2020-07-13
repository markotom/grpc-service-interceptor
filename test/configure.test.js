const GrpcServiceInterceptor = require('..');

const proto = require('./utils/proto');
const grpcServer = require('./utils/grpcServer');

describe('GrpcServiceInterceptor#configure', () => {
  beforeEach(() => {
    this.service = new GrpcServiceInterceptor({
      grpcServer,
      grpcServiceDefinition: proto.routeguide.RouteGuide.service,
    });
  });

  it('should be a function', () => {
    expect(this.service.configure).toBeFunction();
  });

  it('should configure a service', async () => {
    const interceptor1 = jest.fn((ctx, next) => next());
    const interceptor2 = jest.fn((ctx, next) => next());

    const getFeature = jest.fn((ctx) => ctx.callback(null, {}));
    const listFeatures = jest.fn((ctx) => ctx.callback(null, {}));
    const recordRoute = jest.fn((ctx) => ctx.callback(null, {}));
    const routeChat = jest.fn((ctx) => ctx.callback(null, {}));

    this.service.addMethod('getFeature', interceptor1, interceptor2, getFeature);
    this.service.addMethod('listFeatures', interceptor1, interceptor2, listFeatures);
    this.service.addMethod('recordRoute', interceptor1, interceptor2, recordRoute);
    this.service.addMethod('routeChat', interceptor1, interceptor2, routeChat);

    this.service.configure();
    expect(this.service.configured).toBe(true);
  });
});
