const GrpcServiceInterceptor = require('..');

const proto = require('./utils/proto');
const grpcServer = require('./utils/grpcServer');

const grpcServiceDefinition = proto.routeguide.RouteGuide.service;

describe('GrpcServiceInterceptor', () => {
  it('should be a function', () => {
    expect(GrpcServiceInterceptor).toBeFunction();
  });

  it('should create an instance of GrpcServiceInterceptor', () => {
    const grpcService = new GrpcServiceInterceptor({
      grpcServer,
      grpcServiceDefinition,
    });
    expect(grpcService).toBeInstanceOf(GrpcServiceInterceptor);
  });

  it('should have only allowed methods', () => {
    const allowedMethods = ['constructor', 'addMethod', 'initialize'];
    const methods = Object.getOwnPropertyNames(GrpcServiceInterceptor.prototype);
    expect(methods).toIncludeSameMembers(allowedMethods);
  });

  it('should fail missing grpc server', () => {
    const initializeGrpcServer = () =>
      new GrpcServiceInterceptor({ grpcServiceDefinition: this.grpcServiceDefinition });
    expect(initializeGrpcServer).toThrowWithMessage(
      Error,
      'Service should be initiated with a grpc server',
    );
  });

  it('should fail missing grpc service definition', () => {
    const initializeGrpcServer = () => new GrpcServiceInterceptor({ grpcServer });
    expect(initializeGrpcServer).toThrowWithMessage(
      Error,
      'Service should be initiated with a service proto definition',
    );
  });

  it('should fail with an invalid grpc server', () => {
    const initializeGrpcServer = () =>
      new GrpcServiceInterceptor({
        grpcServer: 'invalid',
        grpcServiceDefinition,
      });
    expect(initializeGrpcServer).toThrowWithMessage(
      Error,
      'Service should have a valid grpc server to be initiated',
    );
  });

  it('should be initiated correctly', () => {
    const service = new GrpcServiceInterceptor({
      grpcServer,
      grpcServiceDefinition,
    });
    expect(service.grpcServer).toBe(grpcServer);
    expect(service.grpcServiceDefinition).toBe(grpcServiceDefinition);
    expect(service.methods).toBeObject();
    expect(service.methods).toBeEmpty();
    expect(service.initialized).toBe(false);
  });
});
